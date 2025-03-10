class TutorialAnimations {
    static fadeIn(element) {
        element.style.opacity = '0';
        element.style.display = 'block';
        setTimeout(() => element.style.opacity = '1', 10);
    }

    static fadeOut(element) {
        element.style.opacity = '0';
        setTimeout(() => element.style.display = 'none', 300);
    }
} 