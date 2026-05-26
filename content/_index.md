---
title: "Home"
---

<div class="hero-section">
    <div class="hero-copy">
        <p class="hero-intro">Hi, I'm Brian</p>
        <h1>Building reliable systems through backend engineering.</h1>
        <p class="hero-subtitle">I build reliable backend services, data-heavy systems, and infrastructure-minded software with a strong foundation in algorithms and system design.</p>
        <div class="hero-actions">
            <a class="button button-primary" href="/projects/">View Projects</a>
            <a class="button button-secondary" href="/about/">About Me</a>
        </div>
        {{< social_links >}}
    </div>
    <aside class="hero-card" aria-label="Profile image">
        <img class="hero-avatar" src="/images/website/logo.jpg" alt="Brian Chen">
    </aside>
</div>

<section class="section-block">
    <div class="section-heading">
        <h2>Engineering strengths</h2>
    </div>
    <div class="expertise-grid">
        <article class="expertise-card">
            <i class="fa-solid fa-server"></i>
            <h3>Backend Systems</h3>
            <p>API design, service boundaries, data modeling, and production-minded implementation.</p>
            <div class="skill-list">
                <span>Python</span>
                <span>Java</span>
                <span>REST APIs</span>
            </div>
        </article>
        <article class="expertise-card">
            <i class="fa-solid fa-brain"></i>
            <h3>LLM & AI Agents</h3>
            <p>Agent workflows, RAG systems, and prompt-driven applications using modern AI tooling.</p>
            <div class="skill-list">
                <span>LangGraph</span>
                <span>LangChain</span>
                <span>RAG</span>
            </div>
        </article>
        <article class="expertise-card">
            <i class="fa-solid fa-cloud"></i>
            <h3>Cloud & Infrastructure</h3>
            <p>Serverless, containerized workflows, and cloud delivery for scalable backend services.</p>
            <div class="skill-list">
                <span>AWS</span>
                <span>Docker</span>
                <span>CI/CD</span>
            </div>
        </article>
    </div>
</section>

<section id="projects" class="section-block">
    <div class="section-heading">
        <h2>Selective projects</h2>
    </div>
    <div class="project-strip">
        <a class="project-card" href="/projects/sem-manager/">
            <span class="project-kicker">Memory systems</span>
            <strong>Memory Manager</strong>
            <p>Hash table backed record storage with dynamic memory allocation and compaction logic.</p>
        </a>
        <a class="project-card" href="/projects/tree-db/">
            <span class="project-kicker">Spatial indexing</span>
            <strong>Tree-Based Seminar Database</strong>
            <p>BST and 2D spatial tree database implemented from scratch.</p>
        </a>
        <a class="project-card" href="/projects/external_sort/">
            <span class="project-kicker">Disk I/O</span>
            <strong>External Sorting</strong>
            <p>Replacement selection and multiway merge for datasets larger than memory.</p>
        </a>
        <a class="project-card" href="/projects/graph-hashtable-db/">
            <span class="project-kicker">Graph systems</span>
            <strong>Song / Artist Database</strong>
            <p>Hash tables and graph connectivity tracking with custom data structures.</p>
        </a>
    </div>
</section>

<section class="section-block timeline-section">
    <div class="section-heading section-heading--center">
        <span class="eyebrow">Experience</span>
        <h2>Timeline</h2>
    </div>
    <div class="timeline-wrapper">
    <section class="timeline-block">
        <div class="each-year">
            <div class="each-event">
                <div class="event-year">Current</div>
                <div class="event-title">Virginia Tech</div>
                <div class="event-description">
                    Master of Science in Computer Science<br>
                    Focusing on AI, Software Engineering, and Systems.
                </div>
            </div>
        </div>
        <div class="each-year">
            <div class="each-event">
                <div class="event-year">2022-2024</div>
                <div class="event-title">Software Engineer</div>
                <div class="event-description">
                    Tech Companies in Japan<br>
                    Designed scalable APIs, microservices, and data pipelines.
                </div>
            </div>
        </div>
        <div class="each-year">
            <div class="each-event">
                <div class="event-year">2017-2022</div>
                <div class="event-title">Business Intelligence Engineer</div>
                <div class="event-description">
                    Financial Service Company in Taiwan<br>
                    Bridging business requirements with technical solutions.
                </div>
            </div>
        </div>
        <!-- <div class="each-year">
            <div class="each-event">
                <div class="event-year">2011-2015</div>
                <div class="event-title">National Chengchi University</div>
                <div class="event-description">
                    Bachelor of International Business<br>
                    Strength: Calculus, Statistics, and Time-series Analysis
                </div>
            </div>
        </div> -->
    </section>
    </div>
</section>
