// Utility functions

/**
 * Select a single DOM element
 * @param {string} selector 
 * @returns {HTMLElement}
 */
export const $ = (selector) => document.querySelector(selector);

/**
 * Select all DOM elements
 * @param {string} selector 
 * @returns {NodeList}
 */
export const $$ = (selector) => document.querySelectorAll(selector);

/**
 * Create an element with class and text
 * @param {string} tag 
 * @param {string} className 
 * @param {string} text 
 * @returns {HTMLElement}
 */
export const createElement = (tag, className, text = '') => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
};

/**
 * Format date string
 * @param {string} dateString 
 * @returns {string}
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
