// Intersection Observerの設定
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

// アニメーション用のIntersection Observer
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            animationObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

// アニメーション対象の要素を監視
document.querySelectorAll('.benefit-card, .step, .case-card').forEach(element => {
    element.classList.add('fade-in');
    animationObserver.observe(element);
});

// ヘッダーのスクロール制御
let lastScroll = 0;
const header = document.querySelector('.header');
const scrollThreshold = 50;

const handleScroll = () => {
    const currentScroll = window.pageYOffset;
    
    if (Math.abs(currentScroll - lastScroll) < scrollThreshold) return;

    if (currentScroll > lastScroll && currentScroll > header?.offsetHeight) {
        header?.classList.add('header-hidden');
    } else {
        header?.classList.remove('header-hidden');
    }

    lastScroll = currentScroll;
};

window.addEventListener('scroll', handleScroll, { passive: true });

// モバイルメニューの制御
const menuToggle = document.querySelector('.menu-toggle');
const navMenu = document.querySelector('.nav-menu');
const body = document.body;

let isMenuOpen = false;

const toggleMenu = () => {
    isMenuOpen = !isMenuOpen;
    menuToggle?.classList.toggle('active');
    navMenu?.classList.toggle('active');
    body.style.overflow = isMenuOpen ? 'hidden' : '';
};

menuToggle?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
});

// メニュー外クリックで閉じる
document.addEventListener('click', (e) => {
    if (isMenuOpen && !navMenu?.contains(e.target) && !menuToggle?.contains(e.target)) {
        toggleMenu();
    }
});

// タッチデバイスでのホバー対策
document.addEventListener('touchstart', function() {}, true);

// 画面回転時のメニュー状態リセット
window.addEventListener('orientationchange', () => {
    if (isMenuOpen) {
        toggleMenu();
    }
});

// スムーズスクロールの改善
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        if (isMenuOpen) {
            toggleMenu();
        }

        const href = this.getAttribute('href');
        if (!href) return;

        const target = document.querySelector(href);
        if (!target) return;

        const headerHeight = header?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
            top: targetPosition - headerHeight,
            behavior: 'smooth'
        });
    });
});

// パフォーマンス最適化
document.addEventListener('DOMContentLoaded', () => {
    // 遅延読み込み
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyLoadScript = document.createElement('script');
        lazyLoadScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
        lazyLoadScript.async = true;
        lazyLoadScript.onload = () => {
            const observer = lozad();
            observer.observe();
        };
        document.body.appendChild(lazyLoadScript);
    }

    // Cookie同意の管理
    const cookieConsent = document.getElementById('cookie-consent');
    const cookieAccept = document.getElementById('cookie-accept');

    if (!localStorage.getItem('cookieConsent')) {
        setTimeout(() => {
            cookieConsent?.classList.add('show');
        }, 2000);
    }

    cookieAccept?.addEventListener('click', () => {
        localStorage.setItem('cookieConsent', 'accepted');
        cookieConsent?.classList.remove('show');
    });

    // フォームバリデーションの強化
    const contactForm = document.getElementById('contactForm');
    const formGroups = document.querySelectorAll('.form-group');

    const validateField = (input) => {
        const formGroup = input.closest('.form-group');
        const errorMessage = formGroup?.querySelector('.error-message');
        
        if (!input.value.trim()) {
            formGroup?.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = '必須項目です';
            }
            return false;
        }

        if (input.type === 'email' && !isValidEmail(input.value)) {
            formGroup?.classList.add('error');
            if (errorMessage) {
                errorMessage.textContent = '有効なメールアドレスを入力してください';
            }
            return false;
        }

        formGroup?.classList.remove('error');
        return true;
    };

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    formGroups.forEach(group => {
        const input = group.querySelector('input, textarea');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        group.appendChild(errorDiv);

        input?.addEventListener('blur', () => validateField(input));
        input?.addEventListener('input', () => {
            if (group.classList.contains('error')) {
                validateField(input);
            }
        });
    });

    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;

        formGroups.forEach(group => {
            const input = group.querySelector('input, textarea');
            if (input && !validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        const submitButton = contactForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = '送信中...';
        }

        try {
            // フォームデータの収集
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());

            // API呼び出しのシミュレーション
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 成功メッセージ
            showNotification('お問い合わせを受け付けました。担当者からご連絡いたします。', 'success');
            contactForm.reset();
            formGroups.forEach(group => group.classList.remove('error'));

        } catch (error) {
            console.error('送信エラー:', error);
            showNotification('送信に失敗しました。時間をおいて再度お試しください。', 'error');

        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = '無料相談を申し込む';
            }
        }
    });

    // 通知表示機能
    const showNotification = (message, type = 'success') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    };

    // スクロールアニメーション
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.benefit-card, .step, .case-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-slide-up');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1
        });

        elements.forEach(element => {
            observer.observe(element);
        });
    };

    animateOnScroll();

    // パフォーマンス計測
    if (window.performance) {
        const timing = window.performance.timing;
        window.addEventListener('load', () => {
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            console.log(`ページ読み込み時間: ${loadTime}ms`);
        });
    }
});

// アニメーション用のCSSを動的に追加
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .fade-in.animate {
        opacity: 1;
        transform: translateY(0);
    }
    
    .form-input.invalid {
        border-color: #e53e3e;
    }
    
    .form-input.invalid:focus {
        border-color: #e53e3e;
        box-shadow: 0 0 0 1px #e53e3e;
    }
    
    @media (max-width: 768px) {
        .menu-toggle.active span:nth-child(1) {
            transform: translateY(9px) rotate(45deg);
        }
        
        .menu-toggle.active span:nth-child(2) {
            opacity: 0;
        }
        
        .menu-toggle.active span:nth-child(3) {
            transform: translateY(-9px) rotate(-45deg);
        }
    }

    @keyframes bounce {
        0%, 100% {
            transform: translateY(0);
        }
        50% {
            transform: translateY(-10px);
        }
    }

    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: var(--border-radius);
        background: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }

    .notification.show {
        transform: translateX(0);
    }

    .notification.success {
        border-left: 4px solid #48bb78;
    }

    .notification.error {
        border-left: 4px solid #f56565;
    }

    @media (max-width: 768px) {
        .notification {
            left: 20px;
            right: 20px;
            transform: translateY(-100%);
        }

        .notification.show {
            transform: translateY(0);
        }
    }
`;

document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    // メニュートグルの制御
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    menuToggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
        const spans = menuToggle.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });

    // スムーズスクロール
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            if (!href) return;

            const target = document.querySelector(href);
            if (!target) return;

            // モバイルメニューが開いている場合は閉じる
            navMenu?.classList.remove('active');

            const offset = 70; // ヘッダーの高さ分を考慮
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });

    // フォームのバリデーションと送信処理
    const contactForm = document.getElementById('contactForm');
    contactForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        // フォームデータの取得
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        // 簡易的なバリデーション
        if (!data.name || !data.email || !data.message) {
            alert('必須項目を入力してください。');
            return;
        }

        try {
            // ここにフォーム送信のAPIコールを実装
            // 例: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(data) });
            
            // 送信成功時の処理
            alert('お問い合わせを受け付けました。担当者からご連絡いたします。');
            contactForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert('送信に失敗しました。時間をおいて再度お試しください。');
        }
    });
}); 