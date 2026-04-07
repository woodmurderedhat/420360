export function createHomepageActions({ overlaySystem }) {
  function toggleVideoWindow() {
    const el = document.getElementById('videoThreadWindow');
    if (!el) {
      overlaySystem.createFloatingWindow('videoThreadWindow', 'VIDEOS • SCHWEPE', 'https://schwepe.247420.xyz/videos-thread.html', false);
      overlaySystem.showFloatingWindow('videoThreadWindow');
    } else if (el.classList.contains('hidden')) {
      overlaySystem.showFloatingWindow('videoThreadWindow');
    } else {
      overlaySystem.closeFloatingWindow('videoThreadWindow');
    }
  }

  function openIssues() {
    window.open('https://github.com/woodmurderedhat/420360/issues/new/choose', '_blank', 'noopener');
  }

  return {
    toggleVideoWindow,
    openIssues
  };
}
