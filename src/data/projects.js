/**
 * @typedef {Object} Project
 * @property {string} title
 * @property {string} description
 * @property {string} image - path under /public
 * @property {string} url - external project link or internal route
 */

/** @type {Project[]} */
export const projects = [
  {
    title: 'Nimble Smart Cloud',
    description:
      'The core of all services at Nimble, Smart Cloud allows enterprise level management of all a clients documents.',
    image: 'images/nimble.png',
    url: 'https://nimble.ca/digital-mailroom/',
  },
  {
    title: 'NFL Scoreboard',
    description:
      'A personal project for a live updating scoreboard for viewing scores and stats of NFL games each week',
    image: 'images/scoreboard.png',
    url: '/nflscoreboard',
  },
  {
    title: 'Bleacher Report Redesign',
    description:
      'Contributed to the Bleacher Report website redesign to align with its mobile apps. Developed using Next.js.',
    image: 'images/br.png',
    url: 'https://www.bleacherreport.com',
  },
  {
    title: 'PBS Kids Games',
    description:
      'I supported the PBS Games division by debugging games, providing automated insights into game statistics, supporting legacy site features, and building new site features',
    image: 'images/pbskids.png',
    url: 'https://pbskids.org/games',
  },
  {
    title: 'Five Star Wellbeing',
    description:
      'Lead designer and developer for the FiveStar Wellbeings website overhaul; built the Wellbeing Assessment tool from the ground up.',
    image: 'images/fivestar.png',
    url: 'https://fivestarwellbeing.com/wellbeing-assessment/',
  },
  {
    title: 'REDSpace Shubi',
    description:
      'Lead API developer for the streaming boilerplate product Shubi at REDSpace. Designed and implemented data structure for each endpoint',
    image: 'images/shubi.png',
    url: 'https://www.redspace.com/shubi',
  },
];
