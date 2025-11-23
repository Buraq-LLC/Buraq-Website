<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buraq AI | Intelligence, Surveillance & Reconnaissance</title>
    <meta name="description" content="The first ISR platform bui...ing abusers. AI-powered intelligence for human rights defense.">
    <link rel="icon" type="image/png" href="assets/favicon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="styles.css">
</head>
<body>

    <!-- Animated Background -->
    <div class="animated-bg">
        <div class="floating-orb orb1"></div>
        <div class="floating-orb orb2"></div>
        <div class="floating-orb orb3"></div>
        <div class="floating-orb orb4"></div>
        <div class="floating-orb orb5"></div>
        <div class="floating-orb orb6"></div>
    </div>

    <!-- Progress Bar -->
    <div class="progress-bar" id="progressBar"></div>

    <!-- Navigation -->
    <nav id="navbar">
        <div class="nav-container">
            <div class="nav-left">
                <a href="#hero" class="brand-logo">
                    <div class="logo-icon">
                        <img src="assets/buraq-horse.png" alt="Buraq AI Logo" />
                    </div>
                    <div class="logo-text">
                        <span class="logo-title">Buraq AI</span>
                        <span class="logo-subtitle">ISR Platform</span>
                    </div>
                </a>
            </div>
            <div class="nav-center">
                <ul class="nav-links">
                    <li><a href="#hero" class="nav-link">Overview</a></li>
                    <li><a href="#mission" class="nav-link">Mission</a></li>
                    <li><a href="#capabilities" class="nav-link">Capabilities</a></li>
                    <li><a href="#deployment" class="nav-link">Deployment</a></li>
                    <li><a href="#ethics" class="nav-link">Ethics</a></li>
                    <li><a href="#contact" class="nav-link">Contact</a></li>
                </ul>
            </div>
            <div class="nav-right">
                <button class="nav-cta">
                    <span>Book a briefing</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 13L13 3M6 3H13V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
            <button class="nav-toggle" id="navToggle" aria-label="Open navigation">
                <span></span><span></span><span></span>
            </button>
        </div>
    </nav>

    <!-- Mobile Menu -->
    <div class="mobile-menu" id="mobileMenu">
        <ul class="mobile-nav-links">
            <li><a href="#hero" class="mobile-nav-link">Overview</a></li>
            <li><a href="#mission" class="mobile-nav-link">Mission</a></li>
            <li><a href="#capabilities" class="mobile-nav-link">Capabilities</a></li>
            <li><a href="#deployment" class="mobile-nav-link">Deployment</a></li>
            <li><a href="#ethics" class="mobile-nav-link">Ethics</a></li>
            <li><a href="#contact" class="mobile-nav-link">Contact</a></li>
        </ul>
        <button class="mobile-cta">
            Book a briefing
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L13 3M6 3H13V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        </button>
    </div>

    <!-- Hero Section -->
    <section id="hero" class="section hero-section">
        <div class="hero-gradient"></div>
        <div class="hero-inner">
            <div class="hero-badge-row">
                <div class="hero-badge">
                    <span class="badge-dot"></span>
                    <span>Intelligence · Surveillance · Reconnaissance</span>
                </div>
                <span class="hero-version">Prototype v0.1 · Confidential</span>
            </div>
            
            <div class="hero-layout">
                <div class="hero-content">
                    <h1 class="hero-title">
                        Your tactical shortcut<br />
                        <span class="hero-highlight">to civilian protection.</span>
                    </h1>
                    <p class="hero-subtitle">
                        Buraq AI unifies drone feeds, on-ground sensors, and mission logs into a single, tamper-evident ISR platform—purpose-built for protecting civilians and prosecuting abusers.
                    </p>
                    <div class="hero-actions">
                        <button class="primary-button">
                            Request deployment briefing
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M3 13L13 3M6 3H13V10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button class="secondary-button">
                            Explore capabilities
                            <span class="secondary-icon">↘</span>
                        </button>
                    </div>
                    <div class="hero-meta">
                        <div class="meta-item">
                            <span class="meta-label">Built for</span>
                            <span class="meta-value">Conflict zones & tribunals</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Designed with</span>
                            <span class="meta-value">Tamper-evident ledgers</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Optimized for</span>
                            <span class="meta-value">Operators, not regimes</span>
                        </div>
                    </div>
                </div>
                
                <div class="hero-visual">
                    <div class="hero-video-shell">
                        <div class="hero-video-header">
                            <span class="signal-dot"></span>
                            <span class="signal-label">Live ISR feed · AO-17</span>
                            <span class="signal-meta">Encrypted · Hash-chained</span>
                        </div>
                        <div class="hero-video-frame">
                            <video autoplay muted loop playsinline>
                                <source src="assets/demo1.mp4" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <div class="overlay-tag top-left">
                                <span>Target corridor</span>
                                <span class="tag-pill">AO-17</span>
                            </div>
                            <div class="overlay-tag bottom-right">
                                <span>Threat markers</span>
                                <span class="tag-pill">3x anomaly</span>
                            </div>
                        </div>
                        <div class="hero-video-footer">
                            <div class="hero-stat">
                                <span class="hero-stat-label">Frame integrity</span>
                                <span class="hero-stat-value">SHA-256 ✓</span>
                            </div>
                            <div class="hero-stat">
                                <span class="hero-stat-label">Latency</span>
                                <span class="hero-stat-value">92 ms</span>
                            </div>
                            <div class="hero-stat">
                                <span class="hero-stat-label">Edge nodes</span>
                                <span class="hero-stat-value">12 online</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="hero-footnotes">
                <div class="footnote-item">
                    <span class="dot"></span>
                    <p>All mission data is cryptographically chained and exportable for ICC-aligned casework.</p>
                </div>
                <div class="footnote-item">
                    <span class="dot"></span>
                    <p>Architecture explicitly resists authoritarian centralization—operators retain data control.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Mission Section -->
    <section id="mission" class="section">
        <div class="section-inner">
            <div class="section-header">
                <div class="section-pill">
                    <span class="pill-dot"></span>
                    <span>Mission</span>
                </div>
                <h2 class="section-title">Tactical autonomy, human-centered oversight.</h2>
                <p class="section-description">
                    Buraq empowers field operators and legal teams with a unified ISR stack—streamlining real-time surveillance, evidence capture, and after-action review, while maintaining forensic integrity and global transparency.
                </p>
            </div>
            
            <div class="grid grid-3">
                <article class="card">
                    <div class="card-media card-media-video">
                        <img src="assets/image2.png" alt="Real-time monitoring interface" />
                        <div class="card-label">FIG_M01</div>
                    </div>
                    <div class="card-content">
                        <h3>Real-time multi-AO monitoring</h3>
                        <p>Track multiple operational zones simultaneously with synchronized drone feeds, motion overlays, and AI-prioritized threat annotations.</p>
                        <ul class="card-list">
                            <li>Live battlefield corridor overlays</li>
                            <li>Priority queue for anomaly events</li>
                            <li>Operator-friendly keyboard navigation</li>
                        </ul>
                    </div>
                </article>

                <article class="card">
                    <div class="card-media">
                        <img src="assets/image3.png" alt="Edge AI detection" />
                        <div class="card-label">FIG_M02</div>
                    </div>
                    <div class="card-content">
                        <h3>Edge AI detection when networks fail</h3>
                        <p>Deploy autonomous vision models directly on drones and ground units, ensuring threat recognition even in compromised connectivity environments.</p>
                        <ul class="card-list">
                            <li>On-device inference for critical classes</li>
                            <li>Store-and-forward mission logs</li>
                            <li>Adaptive model updates via secure channels</li>
                        </ul>
                    </div>
                </article>

                <article class="card">
                    <div class="card-media">
                        <img src="assets/image4.png" alt="Evidence chain visualization" />
                        <div class="card-label">FIG_M03</div>
                    </div>
                    <div class="card-content">
                        <h3>Forensic evidence chain by default</h3>
                        <p>Every frame, transcript, and sensor reading is hashed, time-stamped, and linked, forming a tamper-evident record ready for international legal scrutiny.</p>
                        <ul class="card-list">
                            <li>Hash-chains anchored per mission</li>
                            <li>Cryptographic signing per operator</li>
                            <li>One-click ICC bundle export</li>
                        </ul>
                    </div>
                </article>
            </div>

            <div class="grid grid-3">
                <article class="card">
                    <div class="card-media">
                        <img src="assets/image5.png" alt="Signal intelligence panel" />
                        <div class="card-label">FIG_M04</div>
                    </div>
                    <div class="card-content">
                        <h3>Signal intelligence fusion</h3>
                        <p>Fuse visual feeds, RF signatures, and telemetry to anticipate threat patterns before they materialize on the ground.</p>
                        <ul class="card-list">
                            <li>Sensor correlation across domains</li>
                            <li>Predictive alerts based on escalation patterns</li>
                            <li>Operator-tunable sensitivity thresholds</li>
                        </ul>
                    </div>
                </article>

                <article class="card">
                    <div class="card-media">
                        <img src="assets/image6.png" alt="Command center mockup" />
                        <di
