<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
// Override Apache's default Cache-Control: max-age=172800 — this is a live API,
// responses must never be cached or polling will read stale state.
header('Cache-Control: no-store');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$config = __DIR__ . '/speedrun-config.php';
if (!file_exists($config)) {
    http_response_code(503);
    echo json_encode(['error' => 'Server not configured — copy speedrun-config.example.php to speedrun-config.php']);
    exit;
}
require_once $config;

try {
    $pdo = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

initTables($pdo);

try {
    $method = $_SERVER['REQUEST_METHOD'];

    if ($method === 'GET') {
        $code = strtoupper(trim($_GET['room'] ?? ''));
        if (!validateCode($code)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid room code']);
            exit;
        }
        $room = getRoom($pdo, $code);
        if (!$room) {
            http_response_code(404);
            echo json_encode(['error' => 'Room not found']);
            exit;
        }
        echo json_encode($room);

    } elseif ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?? [];
        $action = $body['action'] ?? '';

        switch ($action) {
            case 'create_room':
                $code = createRoom($pdo);
                echo json_encode(['code' => $code]);
                break;

            case 'start':
                $code = requireCode($body);
                startTimer($pdo, $code);
                echo json_encode(getRoom($pdo, $code));
                break;

            case 'pause':
                $code = requireCode($body);
                pauseTimer($pdo, $code);
                echo json_encode(getRoom($pdo, $code));
                break;

            case 'stop_player':
                $code = requireCode($body);
                $slot = (int)($body['slot'] ?? 0);
                $finalTimeMs = (int)($body['finalTimeMs'] ?? 0);
                if ($slot < 1 || $slot > 2) throw new InvalidArgumentException('Invalid slot');
                stopPlayer($pdo, $code, $slot, $finalTimeMs);
                echo json_encode(getRoom($pdo, $code));
                break;

            case 'update_name':
                $code = requireCode($body);
                $slot = (int)($body['slot'] ?? 0);
                $name = trim(substr($body['name'] ?? '', 0, 50));
                if ($slot < 1 || $slot > 2 || $name === '') throw new InvalidArgumentException('Invalid input');
                updateName($pdo, $code, $slot, $name);
                echo json_encode(['ok' => true]);
                break;

            case 'increment_deaths':
                $code = requireCode($body);
                $slot = (int)($body['slot'] ?? 0);
                if ($slot < 1 || $slot > 2) throw new InvalidArgumentException('Invalid slot');
                $deaths = incrementDeaths($pdo, $code, $slot);
                echo json_encode(['deaths' => $deaths]);
                break;

            case 'reset':
                $code = requireCode($body);
                resetRoom($pdo, $code);
                echo json_encode(getRoom($pdo, $code));
                break;

            default:
                http_response_code(400);
                echo json_encode(['error' => 'Unknown action']);
        }
    }
} catch (InvalidArgumentException $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function validateCode(string $code): bool {
    return preg_match('/^[A-Z2-9]{4}$/', $code) === 1;
}

function requireCode(array $body): string {
    $code = strtoupper(trim($body['room'] ?? ''));
    if (!validateCode($code)) throw new InvalidArgumentException('Invalid room code');
    return $code;
}

function nowMs(): int {
    return (int)(microtime(true) * 1000);
}

// ── DB init ──────────────────────────────────────────────────────────────────

function initTables(PDO $pdo): void {
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS speedrun_rooms (
            code            VARCHAR(4)  NOT NULL,
            timer_state     ENUM('idle','running','paused') NOT NULL DEFAULT 'idle',
            start_time_ms   BIGINT UNSIGNED DEFAULT NULL,
            accumulated_ms  BIGINT UNSIGNED NOT NULL DEFAULT 0,
            created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (code)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS speedrun_players (
            room_code   VARCHAR(4)  NOT NULL,
            slot        TINYINT UNSIGNED NOT NULL,
            name        VARCHAR(64) NOT NULL DEFAULT 'Player',
            deaths      INT UNSIGNED NOT NULL DEFAULT 0,
            stopped     TINYINT(1)  NOT NULL DEFAULT 0,
            final_time_ms BIGINT UNSIGNED DEFAULT NULL,
            PRIMARY KEY (room_code, slot),
            FOREIGN KEY (room_code) REFERENCES speedrun_rooms(code) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    ");
}

// ── Room operations ──────────────────────────────────────────────────────────

function generateCode(): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // excludes O, I, 0, 1
    $code = '';
    for ($i = 0; $i < 4; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $code;
}

function createRoom(PDO $pdo): string {
    do {
        $code = generateCode();
        $stmt = $pdo->prepare("SELECT 1 FROM speedrun_rooms WHERE code = ?");
        $stmt->execute([$code]);
    } while ($stmt->fetchColumn());

    $pdo->prepare("INSERT INTO speedrun_rooms (code) VALUES (?)")->execute([$code]);
    $pdo->prepare("
        INSERT INTO speedrun_players (room_code, slot, name) VALUES (?, 1, 'Player 1'), (?, 2, 'Player 2')
    ")->execute([$code, $code]);

    return $code;
}

function getRoom(PDO $pdo, string $code): ?array {
    $stmt = $pdo->prepare("SELECT * FROM speedrun_rooms WHERE code = ?");
    $stmt->execute([$code]);
    $room = $stmt->fetch();
    if (!$room) return null;

    $stmt = $pdo->prepare("SELECT * FROM speedrun_players WHERE room_code = ? ORDER BY slot");
    $stmt->execute([$code]);
    $players = $stmt->fetchAll();

    return [
        'code'   => $room['code'],
        'timer'  => [
            'state'         => $room['timer_state'],
            'startTimeMs'   => $room['start_time_ms'] !== null ? (int)$room['start_time_ms'] : null,
            'accumulatedMs' => (int)$room['accumulated_ms'],
        ],
        'players' => array_map(fn($p) => [
            'slot'        => (int)$p['slot'],
            'name'        => $p['name'],
            'deaths'      => (int)$p['deaths'],
            'stopped'     => (bool)$p['stopped'],
            'finalTimeMs' => $p['final_time_ms'] !== null ? (int)$p['final_time_ms'] : null,
        ], $players),
    ];
}

// ── Timer operations ─────────────────────────────────────────────────────────

function startTimer(PDO $pdo, string $code): void {
    $stmt = $pdo->prepare("SELECT timer_state FROM speedrun_rooms WHERE code = ?");
    $stmt->execute([$code]);
    $row = $stmt->fetch();
    if (!$row || $row['timer_state'] === 'running') return;

    $pdo->prepare("
        UPDATE speedrun_rooms SET timer_state = 'running', start_time_ms = ? WHERE code = ?
    ")->execute([nowMs(), $code]);
}

function pauseTimer(PDO $pdo, string $code): void {
    $stmt = $pdo->prepare("SELECT timer_state, start_time_ms, accumulated_ms FROM speedrun_rooms WHERE code = ?");
    $stmt->execute([$code]);
    $row = $stmt->fetch();
    if (!$row || $row['timer_state'] !== 'running') return;

    $newAccumulated = (int)$row['accumulated_ms'] + (nowMs() - (int)$row['start_time_ms']);

    $pdo->prepare("
        UPDATE speedrun_rooms SET timer_state = 'paused', start_time_ms = NULL, accumulated_ms = ? WHERE code = ?
    ")->execute([$newAccumulated, $code]);
}

function stopPlayer(PDO $pdo, string $code, int $slot, int $finalTimeMs): void {
    $pdo->prepare("
        UPDATE speedrun_players SET stopped = 1, final_time_ms = ? WHERE room_code = ? AND slot = ?
    ")->execute([$finalTimeMs, $code, $slot]);
}

function updateName(PDO $pdo, string $code, int $slot, string $name): void {
    $pdo->prepare("
        UPDATE speedrun_players SET name = ? WHERE room_code = ? AND slot = ?
    ")->execute([$name, $code, $slot]);
}

function incrementDeaths(PDO $pdo, string $code, int $slot): int {
    $pdo->prepare("
        UPDATE speedrun_players SET deaths = deaths + 1 WHERE room_code = ? AND slot = ?
    ")->execute([$code, $slot]);
    $stmt = $pdo->prepare("SELECT deaths FROM speedrun_players WHERE room_code = ? AND slot = ?");
    $stmt->execute([$code, $slot]);
    return (int)$stmt->fetchColumn();
}

function resetRoom(PDO $pdo, string $code): void {
    $pdo->prepare("
        UPDATE speedrun_rooms SET timer_state = 'idle', start_time_ms = NULL, accumulated_ms = 0 WHERE code = ?
    ")->execute([$code]);
    $pdo->prepare("
        UPDATE speedrun_players SET deaths = 0, stopped = 0, final_time_ms = NULL WHERE room_code = ?
    ")->execute([$code]);
}
