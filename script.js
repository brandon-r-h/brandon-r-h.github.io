document.addEventListener('DOMContentLoaded', () => {
    // --- Shared Logic ---
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const bgCanvas = document.getElementById('bg-canvas');
    const terminalContainer = document.getElementById('terminal-container');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'retro') {
            body.classList.add('theme-retro');
            if(bgCanvas) bgCanvas.classList.remove('visible');
        } else {
            body.classList.remove('theme-retro');
            if(bgCanvas) bgCanvas.classList.add('visible');
        }
        // Redraw skill graph if it exists on the page
        if (window.skillGraphDraw) {
            window.skillGraphDraw();
        }
    }

    themeToggle.addEventListener('click', () => {
        const isRetro = body.classList.toggle('theme-retro');
        const newTheme = isRetro ? 'retro' : 'modern';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme') || 'modern';
    applyTheme(savedTheme);

    // --- Mobile Menu ---
    mobileMenuButton.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));

    // --- 3D Background ---
    if (bgCanvas) {
        let scene, camera, renderer, stars;
        function init3DBackground() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
            camera.position.z = 1;
            camera.rotation.x = Math.PI / 2;
            renderer = new THREE.WebGLRenderer({ canvas: bgCanvas, alpha: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            if (!body.classList.contains('theme-retro')) {
                bgCanvas.classList.add('visible');
            }
            const starGeo = new THREE.BufferGeometry();
            const starCount = 6000;
            const posArray = new Float32Array(starCount * 3);
            for (let i = 0; i < starCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 5;
            }
            starGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
            const starMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.005 });
            stars = new THREE.Points(starGeo, starMaterial);
            scene.add(stars);
            window.addEventListener('resize', onWindowResize, false);
            animate3D();
        }
        function animate3D() {
            stars.rotation.z += 0.0002;
            renderer.render(scene, camera);
            requestAnimationFrame(animate3D);
        }
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        init3DBackground();
    }

    // --- Page Specific Initializations ---

    // Home Page: Text Scramble
    if (document.getElementById('scramble-text')) {
        class TextScramble {
            constructor(el) { this.el = el; this.chars = '!<>-_\\/[]{}—=+*^?#________'; this.update = this.update.bind(this); }
            setText(newText) {
                const oldText = this.el.innerText;
                const length = Math.max(oldText.length, newText.length);
                const promise = new Promise((resolve) => this.resolve = resolve);
                this.queue = [];
                for (let i = 0; i < length; i++) {
                    const from = oldText[i] || ''; const to = newText[i] || '';
                    const start = Math.floor(Math.random() * 80);
                    const end = start + Math.floor(Math.random() * 80);
                    this.queue.push({ from, to, start, end });
                }
                cancelAnimationFrame(this.frameRequest); this.frame = 0; this.update(); return promise;
            }
            update() {
                let output = ''; let complete = 0;
                for (let i = 0, n = this.queue.length; i < n; i++) {
                    let { from, to, start, end, char } = this.queue[i];
                    if (this.frame >= end) { complete++; output += to; } 
                    else if (this.frame >= start) {
                        if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
                        output += `<span class="opacity-50">${char}</span>`;
                    } else { output += from; }
                }
                this.el.innerHTML = output;
                if (complete === this.queue.length) { this.resolve(); } 
                else { this.frameRequest = requestAnimationFrame(this.update); this.frame++; }
            }
            randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
        }
        const scrambleEl = document.getElementById('scramble-text');
        const fx = new TextScramble(scrambleEl);
        setTimeout(() => {
            fx.setText(scrambleEl.textContent);
        }, 500);
    }

    // Resume Page: Timeline & Skill Graph
    if (document.getElementById('page-resume')) {
        const resumeData = {
            timeline: [
                { type: 'work', title: 'Operations Specialist', company: 'Nerus Strategies', date: 'Sep 2023 – Present', desc: 'Developed a data pipeline saving 5000+ hours annually using Google\'s REST API, Lambda Cloud,Python, and SQL.' },
                { type: 'edu', title: 'M.S. in Data Science', company: 'Willamette University', date: 'Expected: Aug 2025', desc: 'Pursuing advanced studies in data science, focusing on machine learning and large-scale data systems.' },
                { type: 'edu', title: 'B.S. in CompSci & DataSci', company: 'Willamette University', date: '2025', desc: 'Completed dual majors with a focus on Data Engineering & Software Development.' },
                { type: 'work', title: 'Hardware Security Researcher', company: 'Willamette University', date: 'Jun 2023 – Dec 2024', desc: 'Conducted security research on Intel x86 CPUs, mining register data with QEMU and analyzing patterns with Daikon.' },
                { type: 'work', title: 'Data Analyst Intern', company: 'HBF International', date: 'Jun 2022 – Oct 2022', desc: 'Engineered a Python-based solution that led to a 20% reduction in weekly labor costs by analyzing wage/production data.' },
                { type: 'work', title: 'Robotics Intern', company: 'Miga Motors', date: 'Mar 2020 – Mar 2021', desc: 'Wrote proprietary C++ software for testing robotic arms and conducted stress tests using Arduino.' },
            ],
        };
        const timelineContainer = document.querySelector('.timeline');
        if (timelineContainer) {
            timelineContainer.innerHTML = resumeData.timeline.map(item => `
                <div class="timeline-item">
                    <div class="timeline-content">
                        <h4 class="font-bold text-lg text-white">${item.title}</h4>
                        <p class="text-sky-300">${item.company}</p>
                        <p class="text-gray-400 text-sm mb-2">${item.date}</p>
                        <p class="text-gray-300 text-sm">${item.desc}</p>
                    </div>
                </div>
            `).join('');
            const timelineItems = document.querySelectorAll('.timeline-item');
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => entry.target.classList.toggle('active', entry.isIntersecting));
            }, { root: document.querySelector('.timeline-container'), threshold: 0.5 });
            timelineItems.forEach(item => observer.observe(item));
        }
        initSkillGraph();
    }

    // Projects Page: Filter & Hover
    if (document.getElementById('page-projects')) {
        document.querySelectorAll('.project-filter-btn').forEach(button => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.project-filter-btn').forEach(btn => btn.classList.remove('active', 'bg-sky-600') || btn.classList.add('bg-gray-700', 'hover:bg-sky-600'));
                button.classList.add('active', 'bg-sky-600');
                button.classList.remove('bg-gray-700', 'hover:bg-sky-600');
                const filter = button.dataset.filter;
                document.querySelectorAll('.project-card-container').forEach(card => {
                    const categories = card.dataset.category.split(' ');
                    card.style.display = (filter === 'all' || categories.includes(filter)) ? 'block' : 'none';
                });
            });
        });
        document.querySelectorAll('.project-card-container').forEach(container => {
            const card = container.querySelector('.project-card');
            container.addEventListener('mousemove', e => {
                const rect = container.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const { width, height } = rect;
                const rotateX = (y / height - 0.5) * -25;
                const rotateY = (x / width - 0.5) * 25;
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
            });
            container.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
            });
        });
    }

    // Contact Page: Parallax Cards
    if (document.getElementById('page-contact')) {
        document.querySelectorAll('.contact-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const { width, height } = rect;
                const rotateX = (y / height - 0.5) * -15;
                const rotateY = (x / width - 0.5) * 15;
                card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
                card.querySelector('.contact-card-content').style.transform = `translateZ(20px)`;
                card.querySelector('.contact-card-icon').style.transform = `translateZ(50px) translateY(-10px)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'rotateX(0) rotateY(0)';
                card.querySelector('.contact-card-content').style.transform = `translateZ(0)`;
                card.querySelector('.contact-card-icon').style.transform = `translateZ(0) translateY(0)`;
            });
        });
    }

    // --- Terminal (Global) ---
    async function runHackSimulation() {
        const steps = [
            { text: 'Pinging 127.0.0.1 with 32 bytes of data...', delay: 500 },
            { text: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128', delay: 200 },
            { text: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128', delay: 200 },
            { text: 'Ping statistics for 127.0.0.1: Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)', delay: 500 },
            { text: 'Initiating port scan on localhost...', style: 'text-yellow-400', delay: 1000 },
            { text: 'Discovered open port: 443/https', delay: 500 },
            { text: 'Discovered open port: 3000/dev-server', delay: 500 },
            { text: 'Discovered open port: 8080/http-alt', delay: 500 },
            { text: 'Analyzing port 8080...', delay: 1000 },
            { text: 'Vulnerability found: CVE-2024-BRH-01 (Unsecured DOM interface)', style: 'text-red-500', delay: 500 },
            { text: 'Executing exploit...', delay: 1500 },
            { text: 'Bypassing firewall... [OK]', style: 'text-green-400', delay: 800 },
            { text: 'Injecting payload... [OK]', style: 'text-green-400', delay: 800 },
            { text: 'Gaining root access...', style: 'text-yellow-400', delay: 1200 },
            { text: 'Root access granted.', style: 'text-red-500 font-bold', delay: 500 },
            { text: 'Downloading user data...', delay: 1000 },
            { text: `  > Device: ${navigator.platform}`, delay: 300 },
            { text: `  > Browser: ${navigator.userAgent.match(/(firefox|msie|chrome|safari|trident)/i)[0]}`, delay: 300 },
            { text: `  > Language: ${navigator.language}`, delay: 300 },
            { text: `  > Cookies Enabled: ${navigator.cookieEnabled}`, delay: 300 },
            { text: '...', delay: 1000 },
            { text: 'Just kidding! This is a simulation.', style: 'text-sky-400', delay: 500 },
            { text: 'Your data is safe. Thanks for playing!', style: 'text-sky-400', delay: 500 },
        ];
        terminalInput.disabled = true;
        for (const step of steps) {
            await new Promise(resolve => setTimeout(resolve, step.delay));
            printToTerminal(step.text, `response ${step.style || ''}`);
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
        terminalInput.disabled = false;
        terminalInput.focus();
    }
    const commands = {
        help: `Available commands:\n  help      - Show this message\n  about     - Display a short bio\n  projects  - List my main projects\n  contact   - Show contact information\n  skills    - List my technical skills\n  hack_me   - Run a simulation\n  clear     - Clear the terminal\n  exit      - Close the terminal`,
        about: "I'm an experienced data engineer from Salem, OR, who understands the scarcity of time. I'm passionate about architecting and implementing data-centric systems that yield substantial improvements in efficiency and cost-effectiveness.",
        projects: `1. Real Estate ML Model\n2. Labor Cost Reduction Analysis\n3. Robotics Testing Software`,
        contact: `Email: bertcr7101@gmail.com\nPhone: 971-283-4050\nGitHub: https://github.com/brandon-r-h`,
        skills: `Python, SQL, Data Pipelines, Machine Learning, Cloud Computing, React JS, Flask, Git, C++, R, API Architecture, Web Dev, Debugging, Statistical Modeling`,
        hack_me: runHackSimulation,
    };
    function toggleTerminal(visible) {
        terminalContainer.classList.toggle('visible', visible);
        if (visible) terminalInput.focus();
    }
    document.addEventListener('keydown', e => {
        if (e.ctrlKey && e.key === 't') { e.preventDefault(); toggleTerminal(true); }
        if (e.key === 'Escape' && terminalContainer.classList.contains('visible')) { toggleTerminal(false); }
    });
    document.getElementById('terminal-close-btn').addEventListener('click', () => toggleTerminal(false));
    terminalInput.addEventListener('keydown', e => {
        if (e.key === 'Enter' && !terminalInput.disabled) {
            const command = terminalInput.value.trim().toLowerCase();
            printToTerminal(`guest@brh-portfolio:~$ ${command}`, 'command');
            if (command === 'clear') { terminalOutput.innerHTML = ''; }
            else if (command === 'exit') { toggleTerminal(false); }
            else if (commands[command]) {
                if (typeof commands[command] === 'function') commands[command]();
                else printToTerminal(commands[command], 'response');
            }
            else { printToTerminal(`Command not found: ${command}. Type 'help'.`, 'response'); }
            terminalInput.value = '';
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    });
    function printToTerminal(text, className) { terminalOutput.innerHTML += `<div class="response ${className}">${text}</div>`; }
    printToTerminal("Welcome! Type 'help' to get started.", 'response');
});

function initSkillGraph() {
    const canvas = document.getElementById('skill-graph-canvas');
    if (!canvas) return;
    if (canvas.dataset.animationId) {
        cancelAnimationFrame(canvas.dataset.animationId);
    }

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    const skills = {
        nodes: [
            { id: 'Python', group: 1, size: 35 }, { id: 'SQL', group: 1, size: 30 }, { id: 'Data Pipelines', group: 2, size: 35 },
            { id: 'Machine Learning', group: 2, size: 40 }, { id: 'Cloud Computing', group: 3, size: 30 }, { id: 'React JS', group: 4, size: 25 },
            { id: 'Flask', group: 4, size: 25 }, { id: 'Git', group: 5, size: 25 }, { id: 'C++', group: 5, size: 25 },
            { id: 'R', group: 2, size: 20 }, { id: 'API Architecture', group: 3, size: 30 }, { id: 'Web Dev', group: 4, size: 35 },
            { id: 'Debugging', group: 5, size: 25 }, { id: 'Statistical Modeling', group: 2, size: 30 }
        ],
        links: [
            { source: 'Python', target: 'Data Pipelines' }, { source: 'Python', target: 'Machine Learning' }, { source: 'Python', target: 'Flask' },
            { source: 'SQL', target: 'Data Pipelines' }, { source: 'Data Pipelines', target: 'Cloud Computing' }, { source: 'Machine Learning', target: 'R' },
            { source: 'Machine Learning', target: 'Statistical Modeling' }, { source: 'Flask', target: 'Web Dev' }, { source: 'Flask', target: 'API Architecture' },
            { source: 'React JS', target: 'Web Dev' }, { source: 'Web Dev', target: 'API Architecture' }, { source: 'Web Dev', target: 'Git' },
            { source: 'Python', target: 'Debugging' }
        ]
    };

    let nodes = [], links = [];
    let width, height, center, radius;
    let hoveredNode = null;
    let selectedNode = null;

    function setup() {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        center = { x: width / 2, y: height / 2 };
        radius = Math.min(width, height) * 0.4;
        
        nodes = skills.nodes.map((node, i) => {
            const angle = (i / skills.nodes.length) * 2 * Math.PI;
            return { ...node, x: center.x + radius * Math.cos(angle), y: center.y + radius * Math.sin(angle) };
        });

        links = skills.links.map(link => ({
            source: nodes.find(n => n.id === link.source),
            target: nodes.find(n => n.id === link.target)
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);
        const isRetro = document.body.classList.contains('theme-retro');
        const time = Date.now() * 0.001;
        const activeNode = selectedNode || hoveredNode;
        let connectedNodes = new Set();
        if (activeNode) {
            connectedNodes.add(activeNode.id);
            links.forEach(link => {
                if (link.source.id === activeNode.id) connectedNodes.add(link.target.id);
                if (link.target.id === activeNode.id) connectedNodes.add(link.source.id);
            });
        }

        links.forEach(link => {
            const isConnected = activeNode && (link.source.id === activeNode.id || link.target.id === activeNode.id);
            ctx.beginPath();
            ctx.moveTo(link.source.x, link.source.y);
            ctx.lineTo(link.target.x, link.target.y);
            ctx.strokeStyle = isConnected ? (isRetro ? '#39ff14' : '#38bdf8') : (activeNode ? 'rgba(55, 65, 81, 0.2)' : 'rgba(55, 65, 81, 0.5)');
            ctx.lineWidth = isConnected ? 2 : 1;
            ctx.stroke();
        });

        nodes.forEach(node => {
            const isConnected = activeNode && connectedNodes.has(node.id);
            const pulse = 1 + Math.sin(time * 2 + node.x) * 0.05;
            const size = node.size * (isRetro ? 1 : pulse);
            ctx.beginPath();
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
            
            let nodeFill, nodeStroke, textFill, nodeLineWidth;
            if (!activeNode || isConnected) {
                nodeFill = (node.id === activeNode?.id) ? (isRetro ? '#39ff14' : '#38bdf8') : (isRetro ? '#1c1917' : '#1f2937');
                nodeStroke = isRetro ? '#39ff14' : '#38bdf8';
                nodeLineWidth = 2;
                textFill = (node.id === activeNode?.id) ? (isRetro ? '#0a0a0a' : '#111827') : (isRetro ? '#a3e635' : '#d1d5db');
            } else {
                nodeFill = isRetro ? 'rgba(28, 25, 23, 0.7)' : 'rgba(31, 41, 55, 0.7)';
                nodeStroke = isRetro ? 'rgba(57, 255, 20, 0.4)' : 'rgba(56, 189, 248, 0.4)';
                nodeLineWidth = 1;
                textFill = isRetro ? '#a3e635' : '#d1d5db';
            }

            ctx.fillStyle = nodeFill;
            ctx.strokeStyle = nodeStroke;
            ctx.lineWidth = nodeLineWidth;
            if (!isRetro && (node.id === activeNode?.id)) {
                ctx.shadowColor = '#38bdf8';
                ctx.shadowBlur = 15;
            }
            ctx.fill();
            ctx.stroke();
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = textFill;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const words = node.id.split(' ');
            if (words.length > 1) {
                const fontSize = isRetro ? 8 : 12;
                const lineHeight = isRetro ? 10 : 14;
                ctx.font = isRetro ? `${fontSize}px "Press Start 2P"` : `bold ${fontSize}px Inter`;
                ctx.fillText(words[0], node.x, node.y - lineHeight / 2);
                ctx.fillText(words[1], node.x, node.y + lineHeight / 2);
            } else {
                const fontSize = isRetro ? 10 : 12;
                ctx.font = isRetro ? `${fontSize}px "Press Start 2P"` : `bold ${fontSize}px Inter`;
                ctx.fillText(node.id, node.x, node.y);
            }
        });
        canvas.dataset.animationId = requestAnimationFrame(draw);
    }
    window.skillGraphDraw = draw; 
    
    function findNodeAtPos(x, y, nodes, radius) {
         for (const node of nodes) {
            const dist = Math.sqrt((x - node.x)**2 + (y - node.y)**2);
            if (dist < node.size) return node;
        }
        return null;
    }

    if (canvas) {
        canvas.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            hoveredNode = findNodeAtPos(e.clientX - rect.left, e.clientY - rect.top, nodes);
        });
        canvas.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            selectedNode = findNodeAtPos(e.clientX - rect.left, e.clientY - rect.top, nodes);
        });
    }
    
    window.addEventListener('resize', setup);
    setup();
    draw();
}
