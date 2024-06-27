document.addEventListener('DOMContentLoaded', () => {
    const stick = document.querySelector('.joystick .stick');
    let isDragging = false;
  
    stick.addEventListener('mousedown', (e) => {
      isDragging = true;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  
    function onMouseMove(e) {
      if (isDragging) {
        const rect = stick.parentNode.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const angle = Math.atan2(y, x);
        const distance = Math.min(30, Math.sqrt(x * x + y * y));
        stick.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
      }
    }
  
    function onMouseUp() {
      isDragging = false;
      stick.style.transform = 'translate(0, 0)';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }
  });
  