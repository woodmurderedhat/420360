export function createHomepageActions() {
  function toggleVideoWindow() {
    window.open('https://www.youtube.com/@woodenhat/videos', '_blank', 'noopener');
  }

  function openIssues() {
    window.open('https://github.com/woodmurderedhat/420360/issues/new/choose', '_blank', 'noopener');
  }

  return {
    toggleVideoWindow,
    openIssues
  };
}
