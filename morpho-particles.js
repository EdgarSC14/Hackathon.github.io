// Sistema de partículas estilo Morpho con círculo interactivo
class MorphoParticles {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.circleRadius = 180; // Radio más grande para parecerse más a Morpho
        this.circleCenter = { x: 0, y: 0 };
        this.scrollProgress = 0;
        this.isScrolling = false;
        this.sponsorsVisible = false;
        this.circleOpacity = 1; // Opacidad del círculo para animación de desaparición
        this.circleBaseY = 0; // Posición Y base del círculo (sin scroll)
        this.explosionActive = false; // Estado de explosión
        this.explosionProgress = 0; // Progreso de la explosión (0-1)
        this.explosionTriggered = false; // Si ya se activó la explosión
        
        // Partículas que forman el círculo
        this.circleParticles = [];
        this.circleParticleCount = 100; // Número de partículas para formar el círculo (más partículas = círculo más denso)
        
        // Animaciones GSAP
        this.circleAnimations = null;
        
        // Configuración
        this.particleCount = 400; // Más partículas para llenar el círculo
        this.innerParticleCount = 200; // Partículas específicas para el interior del círculo
        this.collectedParticles = [];
        this.scatteredParticles = [];
        this.mouseNearCircle = false;
        this.innerParticles = []; // Partículas dentro del círculo
        this.isHomeSection = true; // Control de si estamos en la sección home
        
        this.init();
    }
    
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.onMouseMove(e));
        window.addEventListener('scroll', () => this.onScroll());
        
        // Observar cambios en las secciones para mostrar/ocultar el círculo
        this.observeSectionChanges();
        
        // Cargar logo si existe
        this.logoImage = null;
        this.loadLogo();
        
        // Crear partículas del círculo (borde)
        this.createCircleParticles();
        
        // Crear partículas dentro del círculo
        this.createInnerParticles();
        
        // Crear partículas normales (exteriores)
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
        
        // Inicializar animaciones GSAP para el círculo
        this.initCircleAnimations();
        
        this.animate();
        
        // Actualizar posición del círculo periódicamente para seguir la sección hero
        setInterval(() => this.updateCirclePosition(), 100);
    }
    
    createCircleParticles() {
        // Crear partículas que formarán el borde del círculo
        for (let i = 0; i < this.circleParticleCount; i++) {
            const angle = (i / this.circleParticleCount) * Math.PI * 2;
            const particle = {
                angle: angle,
                baseAngle: angle, // Ángulo base
                radius: this.circleRadius,
                baseRadius: this.circleRadius,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                size: 2 + Math.random() * 2, // Tamaño variado entre 2-4 para efecto más orgánico
                opacity: 0.6 + Math.random() * 0.3, // Opacidad variada
                hue: 240 + Math.sin(i / 10) * 20 + (i % 15) * 1.5, // Variación de color más suave
                pulsePhase: Math.random() * Math.PI * 2, // Fase aleatoria para pulso
                originalOpacity: 0.6 + Math.random() * 0.3,
                originalSize: 2 + Math.random() * 2,
                exploded: false,
                velocityX: 0,
                velocityY: 0,
                glowIntensity: 0.5 + Math.random() * 0.5 // Intensidad de resplandor variable
            };
            
            this.circleParticles.push(particle);
        }
        
        // Actualizar posiciones iniciales
        this.updateCircleParticlesPosition();
    }
    
    createInnerParticles() {
        // Crear partículas que llenan el interior del círculo
        for (let i = 0; i < this.innerParticleCount; i++) {
            const particle = {
                // Posición aleatoria dentro del círculo
                angle: Math.random() * Math.PI * 2,
                baseAngle: 0,
                radius: Math.random() * this.circleRadius * 0.9, // Dentro del círculo
                baseRadius: Math.random() * this.circleRadius * 0.9,
                x: 0,
                y: 0,
                targetX: 0,
                targetY: 0,
                size: 1.5 + Math.random() * 2, // Partículas más pequeñas para el interior
                opacity: 0.4 + Math.random() * 0.4,
                hue: 240 + Math.sin(i / 10) * 30 + Math.random() * 20,
                pulsePhase: Math.random() * Math.PI * 2,
                originalOpacity: 0.4 + Math.random() * 0.4,
                originalSize: 1.5 + Math.random() * 2,
                exploded: false,
                velocityX: 0,
                velocityY: 0,
                glowIntensity: 0.3 + Math.random() * 0.4,
                inCircle: true, // Marcar como dentro del círculo
                inner: true // Marcar como partícula interior
            };
            
            this.innerParticles.push(particle);
        }
        
        // Actualizar posiciones iniciales
        this.updateInnerParticlesPosition();
    }
    
    updateInnerParticlesPosition() {
        this.innerParticles.forEach(p => {
            if (!p.exploded) {
                // Movimiento orgánico dentro del círculo
                const time = Date.now() * 0.001;
                const radiusVariation = Math.sin(p.pulsePhase + time) * 10;
                const angleVariation = Math.cos(p.pulsePhase * 0.7 + time * 0.5) * 0.1;
                const currentRadius = Math.max(10, Math.min(this.circleRadius * 0.9, p.baseRadius + radiusVariation));
                const currentAngle = p.angle + angleVariation;
                
                p.targetX = this.circleCenter.x + Math.cos(currentAngle) * currentRadius;
                p.targetY = this.circleCenter.y + Math.sin(currentAngle) * currentRadius;
                
                // Interpolación suave
                p.x += (p.targetX - p.x) * 0.12;
                p.y += (p.targetY - p.y) * 0.12;
                
                // Mantener dentro del círculo
                const distFromCenter = Math.sqrt(
                    Math.pow(p.x - this.circleCenter.x, 2) + 
                    Math.pow(p.y - this.circleCenter.y, 2)
                );
                
                if (distFromCenter > this.circleRadius * 0.95) {
                    const angle = Math.atan2(p.y - this.circleCenter.y, p.x - this.circleCenter.x);
                    p.x = this.circleCenter.x + Math.cos(angle) * this.circleRadius * 0.9;
                    p.y = this.circleCenter.y + Math.sin(angle) * this.circleRadius * 0.9;
                }
            }
        });
    }
    
    updateCircleParticlesPosition() {
        this.circleParticles.forEach(p => {
            if (!p.exploded) {
                // Calcular posición en el círculo con variaciones sutiles para efecto orgánico
                const time = Date.now() * 0.0008; // Velocidad de variación más lenta
                const variation = Math.sin(p.pulsePhase + time) * 2; // Variación más sutil
                const radialVariation = Math.cos(p.pulsePhase * 1.5 + time * 0.7) * 1.5; // Variación radial adicional
                const currentRadius = p.baseRadius + variation + radialVariation;
                
                p.targetX = this.circleCenter.x + Math.cos(p.angle) * currentRadius;
                p.targetY = this.circleCenter.y + Math.sin(p.angle) * currentRadius;
                
                // Interpolación más suave hacia la posición objetivo
                const lerpFactor = 0.15; // Interpolación más rápida pero suave
                p.x += (p.targetX - p.x) * lerpFactor;
                p.y += (p.targetY - p.y) * lerpFactor;
            }
        });
    }
    
    initCircleAnimations() {
        if (typeof gsap === 'undefined') return;
        
        // Animación continua de rotación suave del círculo (más lenta y suave)
        let rotationProgress = { value: 0 };
        this.circleAnimations = gsap.to(rotationProgress, {
            value: 360,
            duration: 40, // 40 segundos para una rotación completa (más lento)
            repeat: -1,
            ease: "none",
            onUpdate: () => {
                this.circleParticles.forEach((p) => {
                    // Rotación lenta y continua del círculo
                    const rotationRadians = (rotationProgress.value * Math.PI) / 180;
                    p.angle = p.baseAngle + rotationRadians;
                });
            }
        });
        
        // Animación de pulso para cada partícula del círculo (más sutil)
        this.circleParticles.forEach((p, index) => {
            // Guardar valores originales
            const originalOpacity = p.originalOpacity;
            const originalSize = p.originalSize;
            
            // Animación de opacidad (pulso más sutil)
            gsap.to(p, {
                opacity: originalOpacity * 0.5, // Menos variación de opacidad
                duration: 2 + Math.random() * 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.015 // Delay más corto para transiciones más suaves
            });
            
            // Animación de tamaño (pulso más sutil)
            gsap.to(p, {
                size: originalSize * 1.5, // Menos variación de tamaño
                duration: 2.5 + Math.random() * 1.5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.012
            });
            
            // Animación de intensidad de resplandor (nuevo)
            gsap.to(p, {
                glowIntensity: p.glowIntensity * 1.3,
                duration: 1.8 + Math.random() * 0.8,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: index * 0.01
            });
        });
    }
    
    updateCirclePosition() {
        const heroSection = document.querySelector('.hero-circle-section');
        if (heroSection) {
            const heroRect = heroSection.getBoundingClientRect();
            
            // Calcular posición base absoluta (posición inicial del círculo en el documento)
            if (this.circleBaseY === 0) {
                // Calcular la posición inicial cuando la página se carga
                const initialScroll = window.scrollY;
                this.circleBaseY = heroRect.top + heroRect.height / 2 + initialScroll;
            }
            
            // El círculo se mueve hacia arriba con el scroll
            this.circleCenter.x = heroRect.left + heroRect.width / 2;
            
            // Calcular nueva posición Y (disminuye cuando sube el scroll)
            const scrollY = window.scrollY;
            const newY = this.circleBaseY - scrollY;
            this.circleCenter.y = newY;
            
            // Verificar si el círculo está fuera de la pantalla visible
            const viewportTop = 0;
            const viewportBottom = window.innerHeight;
            const circleTop = newY - this.circleRadius;
            const circleBottom = newY + this.circleRadius;
            
            // Calcular distancia desde el viewport para un desvanecido más suave
            let distanceFromViewport = 0;
            
            if (circleBottom < viewportTop) {
                // El círculo está arriba del viewport
                distanceFromViewport = viewportTop - circleBottom;
            } else if (circleTop > viewportBottom) {
                // El círculo está abajo del viewport
                distanceFromViewport = circleTop - viewportBottom;
            }
            
            // Crear zona de explosión - cuando el círculo está saliendo del viewport
            const explosionTriggerDistance = window.innerHeight * 0.2; // Activar explosión cuando está a 20% del viewport
            
            if (distanceFromViewport > explosionTriggerDistance && !this.explosionTriggered) {
                // Activar explosión solo una vez
                this.explosionTriggered = true;
                this.explosionActive = true;
                this.explosionProgress = 0;
                this.triggerExplosion();
            }
            
            // Si hay una explosión activa, actualizar progreso
            if (this.explosionActive) {
                this.explosionProgress += 0.02; // Progreso de la explosión
                this.explosionProgress = Math.min(1, this.explosionProgress);
                
                // El círculo desaparece gradualmente durante la explosión
                this.circleOpacity = 1 - this.explosionProgress;
                
                // Si la explosión terminó, desactivar
                if (this.explosionProgress >= 1) {
                    this.explosionActive = false;
                    this.circleOpacity = 0;
                }
            } else if (distanceFromViewport <= explosionTriggerDistance) {
                // Resetear si el círculo vuelve a entrar en el viewport
                this.explosionTriggered = false;
                if (this.circleOpacity < 1) {
                    // Animar aparición cuando vuelve a estar visible (muy suave)
                    this.circleOpacity += (1 - this.circleOpacity) * 0.03;
                }
            }
            
            // Asegurar que la opacidad esté en el rango correcto
            this.circleOpacity = Math.max(0, Math.min(1, this.circleOpacity));
        } else {
            // Fallback si no existe la sección
            this.circleCenter.x = this.canvas.width / 2;
            this.circleCenter.y = Math.min(this.canvas.height * 0.35, 400);
        }
    }
    
    loadLogo() {
        // Intentar cargar un logo desde assets, si no existe, crearemos uno minimalista
        const logoImg = new Image();
        
        // Intentar diferentes formatos de logo
        const possibleLogos = [
            'assets/images/logo.png',
            'assets/images/logo.svg',
            'assets/images/logo.jpg',
            'assets/images/logo.jpeg'
        ];
        
        let logoIndex = 0;
        
        logoImg.onload = () => {
            this.logoImage = logoImg;
        };
        
        logoImg.onerror = () => {
            logoIndex++;
            if (logoIndex < possibleLogos.length) {
                // Intentar siguiente formato
                logoImg.src = possibleLogos[logoIndex];
            } else {
                // Si ninguna imagen cargó, crear logo minimalista
                this.createMinimalistLogo();
            }
        };
        
        // Iniciar carga del primer logo
        if (possibleLogos.length > 0) {
            logoImg.src = possibleLogos[0];
        } else {
            this.createMinimalistLogo();
        }
    }
    
    createMinimalistLogo() {
        // Crear un logo minimalista usando canvas
        const logoCanvas = document.createElement('canvas');
        const size = 200;
        logoCanvas.width = size;
        logoCanvas.height = size;
        const ctx = logoCanvas.getContext('2d');
        
        // Fondo transparente
        ctx.clearRect(0, 0, size, size);
        
        // Logo minimalista: círculo con forma abstracta
        ctx.save();
        
        // Círculo exterior sutil
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        
        // Forma central abstracta (ondas o formas geométricas)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        
        // Crear una forma abstracta minimalista (ondas concéntricas)
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size * 0.25;
        
        // Forma tipo onda o círculo con gradiente
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.6)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Núcleo brillante
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        // Líneas decorativas minimalistas
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1.5;
        
        // Líneas radiales sutiles
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.lineTo(
                centerX + Math.cos(angle) * radius * 0.8,
                centerY + Math.sin(angle) * radius * 0.8
            );
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Convertir canvas a imagen
        const img = new Image();
        img.onload = () => {
            this.logoImage = img;
        };
        img.src = logoCanvas.toDataURL('image/png');
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Calcular posición del círculo basándose en la sección hero
        this.updateCirclePosition();
        
        // Recalcular posiciones de partículas
        this.particles.forEach(p => {
            if (!p.initialized) {
                this.setParticlePosition(p);
                p.initialized = true;
            }
        });
    }
    
    createParticle() {
        const particle = {
            x: 0,
            y: 0,
            initialX: 0,
            initialY: 0,
            targetX: 0,
            targetY: 0,
            radius: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.2,
            angle: Math.random() * Math.PI * 2,
            distance: Math.random() * 300 + 100,
            opacity: Math.random() * 0.5 + 0.2,
            hue: Math.random() * 60 + 220, // Púrpura/azul
            initialized: false,
            inCircle: true,
            scattered: false,
            exploded: false,
            velocityX: 0,
            velocityY: 0,
            explosionSpeed: 0,
            explosionFade: 1
        };
        
        this.setParticlePosition(particle);
        return particle;
    }
    
    setParticlePosition(particle) {
        if (particle.inCircle && !particle.scattered) {
            // Posición alrededor del círculo
            particle.initialX = this.circleCenter.x + Math.cos(particle.angle) * particle.distance;
            particle.initialY = this.circleCenter.y + Math.sin(particle.angle) * particle.distance;
            particle.x = particle.initialX;
            particle.y = particle.initialY;
        } else {
            // Posición dispersa por toda la pantalla
            particle.x = Math.random() * this.canvas.width;
            particle.y = Math.random() * this.canvas.height;
            particle.targetX = particle.x;
            particle.targetY = particle.y;
        }
    }
    
    onMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        
        if (this.sponsorsVisible) return;
        
        // Verificar si el mouse está cerca del círculo
        const distanceToCircle = Math.sqrt(
            Math.pow(this.mouse.x - this.circleCenter.x, 2) + 
            Math.pow(this.mouse.y - this.circleCenter.y, 2)
        );
        
        const interactionRadius = this.circleRadius * 3;
        this.mouseNearCircle = distanceToCircle < interactionRadius;
        
        if (this.mouseNearCircle) {
            // Calcular fuerza de atracción basada en la distancia del mouse
            const influence = 1 - (distanceToCircle / interactionRadius);
            
            // Verificar si el mouse está dentro del círculo
            const isMouseInsideCircle = distanceToCircle < this.circleRadius;
            
            // Atraer/repeler partículas normales según la posición del mouse
            this.particles.forEach(p => {
                if (p.inCircle && !p.scattered) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const distToMouse = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distToMouse < 200) {
                        // Repeler partículas del mouse
                        const force = (1 / (distToMouse + 1)) * influence * 30;
                        p.targetX += (dx / distToMouse) * force;
                        p.targetY += (dy / distToMouse) * force;
                    }
                    
                    // Atracción hacia el círculo
                    const dxToCenter = this.circleCenter.x - p.x;
                    const dyToCenter = this.circleCenter.y - p.y;
                    const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);
                    
                    if (distToCenter > 0) {
                        const centerForce = (1 / distToCenter) * 20;
                        p.targetX += (dxToCenter / distToCenter) * centerForce * 0.1;
                        p.targetY += (dyToCenter / distToCenter) * centerForce * 0.1;
                    }
                }
            });
            
            // Interacción con partículas del borde del círculo
            if (isMouseInsideCircle) {
                this.circleParticles.forEach(p => {
                    if (!p.exploded) {
                        const dx = p.x - this.mouse.x;
                        const dy = p.y - this.mouse.y;
                        const distToMouse = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distToMouse < 150) {
                            const force = (1 / (distToMouse + 1)) * influence * 25;
                            p.targetX += (dx / distToMouse) * force;
                            p.targetY += (dy / distToMouse) * force;
                        }
                    }
                });
            }
            
            // Interacción con partículas internas del círculo
            this.innerParticles.forEach(p => {
                if (!p.exploded && isMouseInsideCircle) {
                    const dx = p.x - this.mouse.x;
                    const dy = p.y - this.mouse.y;
                    const distToMouse = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distToMouse < 100) {
                        // Repeler partículas del mouse con más fuerza
                        const force = (1 / (distToMouse + 1)) * influence * 40;
                        p.targetX += (dx / distToMouse) * force;
                        p.targetY += (dy / distToMouse) * force;
                    } else if (distToMouse < 200) {
                        // Atracción suave hacia el mouse si está cerca
                        const force = (1 / (distToMouse + 1)) * influence * 15;
                        p.targetX -= (dx / distToMouse) * force;
                        p.targetY -= (dy / distToMouse) * force;
                    }
                    
                    // Asegurar que las partículas vuelvan al círculo
                    const distFromCenter = Math.sqrt(
                        Math.pow(p.x - this.circleCenter.x, 2) + 
                        Math.pow(p.y - this.circleCenter.y, 2)
                    );
                    
                    if (distFromCenter > this.circleRadius * 0.95) {
                        const dxToCenter = this.circleCenter.x - p.x;
                        const dyToCenter = this.circleCenter.y - p.y;
                        const distToCenter = Math.sqrt(dxToCenter * dxToCenter + dyToCenter * dyToCenter);
                        
                        if (distToCenter > 0) {
                            const returnForce = (distFromCenter - this.circleRadius * 0.9) * 0.5;
                            p.targetX += (dxToCenter / distToCenter) * returnForce;
                            p.targetY += (dyToCenter / distToCenter) * returnForce;
                        }
                    }
                }
            });
        }
    }
    
    onScroll() {
        this.scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        this.scrollProgress = Math.min(Math.max(this.scrollProgress, 0), 1);
        
        // Actualizar posición del círculo al hacer scroll
        this.updateCirclePosition();
        
        // Activar dispersión después de cierto scroll (sin mostrar sponsors)
        if (this.scrollProgress > 0.3 && !this.sponsorsVisible) {
            this.scatterParticles();
            this.sponsorsVisible = true;
            // this.showSponsors(); // Deshabilitado
        } else if (this.scrollProgress <= 0.25 && this.sponsorsVisible) {
            this.collectParticles();
            this.sponsorsVisible = false;
            // this.hideSponsors(); // Deshabilitado
        }
    }
    
    triggerExplosion() {
        // Efecto de explosión: todas las partículas salen disparadas desde el centro
        
        // Explosión de partículas del círculo (borde)
        this.circleParticles.forEach(p => {
            if (!p.exploded) {
                p.exploded = true;
                const angle = p.angle + (Math.random() - 0.5) * 0.5; // Ángulo basado en posición + variación
                const explosionSpeed = Math.random() * 10 + 6;
                
                p.velocityX = Math.cos(angle) * explosionSpeed;
                p.velocityY = Math.sin(angle) * explosionSpeed;
                
                // Animación GSAP para la explosión de partículas del círculo
                if (typeof gsap !== 'undefined') {
                    gsap.to(p, {
                        opacity: 0,
                        duration: 1.5 + Math.random() * 0.5,
                        ease: "power2.out"
                    });
                    
                    gsap.to(p, {
                        size: 0,
                        duration: 1 + Math.random() * 0.5,
                        ease: "power2.in"
                    });
                }
            }
        });
        
        // Explosión de partículas internas del círculo
        this.innerParticles.forEach(p => {
            if (!p.exploded) {
                p.exploded = true;
                
                // Calcular ángulo desde el centro hacia donde está la partícula
                const angle = Math.atan2(p.y - this.circleCenter.y, p.x - this.circleCenter.x);
                // Agregar variación aleatoria al ángulo
                const randomVariation = (Math.random() - 0.5) * 1.2;
                const finalAngle = angle + randomVariation;
                
                // Velocidad basada en la distancia desde el centro
                const distFromCenter = Math.sqrt(
                    Math.pow(p.x - this.circleCenter.x, 2) + 
                    Math.pow(p.y - this.circleCenter.y, 2)
                );
                const baseSpeed = 8 + (distFromCenter / this.circleRadius) * 4;
                const explosionSpeed = baseSpeed + Math.random() * 6;
                
                p.velocityX = Math.cos(finalAngle) * explosionSpeed;
                p.velocityY = Math.sin(finalAngle) * explosionSpeed;
                
                // Animación GSAP para la explosión
                if (typeof gsap !== 'undefined') {
                    gsap.to(p, {
                        opacity: 0,
                        duration: 1.2 + Math.random() * 0.8,
                        ease: "power2.out"
                    });
                    
                    gsap.to(p, {
                        size: 0,
                        duration: 0.8 + Math.random() * 0.4,
                        ease: "power2.in"
                    });
                }
            }
        });
        
        // Explosión de partículas normales que están cerca del círculo
        this.particles.forEach(p => {
            if (p.inCircle && !p.scattered) {
                const distFromCenter = Math.sqrt(
                    Math.pow(p.x - this.circleCenter.x, 2) + 
                    Math.pow(p.y - this.circleCenter.y, 2)
                );
                
                // Solo explotar si está dentro del radio del círculo
                if (distFromCenter < this.circleRadius * 1.2) {
                    p.exploded = true;
                    p.inCircle = false;
                    p.scattered = true;
                    
                    // Calcular ángulo desde el centro hacia la partícula
                    const angle = Math.atan2(p.y - this.circleCenter.y, p.x - this.circleCenter.x);
                    const randomVariation = (Math.random() - 0.5) * 0.8;
                    const finalAngle = angle + randomVariation;
                    
                    // Velocidad de explosión
                    const explosionSpeed = Math.random() * 10 + 6;
                    const explosionDistance = Math.random() * 800 + 500;
                    
                    // Calcular posición objetivo
                    p.targetX = this.circleCenter.x + Math.cos(finalAngle) * explosionDistance;
                    p.targetY = this.circleCenter.y + Math.sin(finalAngle) * explosionDistance;
                    
                    // Velocidad inicial alta para el efecto de explosión
                    p.velocityX = Math.cos(finalAngle) * explosionSpeed;
                    p.velocityY = Math.sin(finalAngle) * explosionSpeed;
                    p.explosionSpeed = explosionSpeed;
                    
                    // Reducir opacidad gradualmente durante la explosión
                    p.explosionFade = 1;
                }
            }
        });
    }
    
    scatterParticles() {
        this.particles.forEach(p => {
            if (p.inCircle) {
                p.scattered = true;
                p.inCircle = false;
                p.targetX = Math.random() * this.canvas.width;
                p.targetY = Math.random() * this.canvas.height;
                p.scatterSpeed = Math.random() * 3 + 2;
            }
        });
    }
    
    collectParticles() {
        // Recopilar partículas del círculo (borde)
        this.circleParticles.forEach(p => {
            if (p.exploded) {
                p.exploded = false;
                p.velocityX = 0;
                p.velocityY = 0;
                p.opacity = p.originalOpacity;
                p.size = p.originalSize;
                
                // Animación GSAP para restaurar el círculo
                if (typeof gsap !== 'undefined') {
                    gsap.to(p, {
                        opacity: p.originalOpacity,
                        size: p.originalSize,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            }
        });
        
        // Recopilar partículas internas
        this.innerParticles.forEach(p => {
            if (p.exploded) {
                p.exploded = false;
                p.velocityX = 0;
                p.velocityY = 0;
                p.opacity = p.originalOpacity;
                p.size = p.originalSize;
                
                // Restaurar posición dentro del círculo
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.circleRadius * 0.9;
                p.angle = angle;
                p.baseRadius = radius;
                
                // Animación GSAP para restaurar
                if (typeof gsap !== 'undefined') {
                    gsap.to(p, {
                        opacity: p.originalOpacity,
                        size: p.originalSize,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            }
        });
        
        // Recopilar partículas normales
        this.particles.forEach(p => {
            if (p.scattered || p.exploded) {
                p.scattered = false;
                p.exploded = false;
                p.inCircle = true;
                p.velocityX = 0;
                p.velocityY = 0;
                p.explosionFade = 1;
                p.targetX = this.circleCenter.x + Math.cos(p.angle) * p.distance;
                p.targetY = this.circleCenter.y + Math.sin(p.angle) * p.distance;
            }
        });
        this.explosionTriggered = false;
        this.explosionActive = false;
        this.explosionProgress = 0;
    }
    
    showSponsors() {
        // Deshabilitado - ya no mostramos sponsors
        // const sponsorsContainer = document.getElementById('sponsors-container');
        // if (sponsorsContainer) {
        //     sponsorsContainer.classList.add('visible');
        // }
    }
    
    hideSponsors() {
        // Deshabilitado - ya no mostramos sponsors
        // const sponsorsContainer = document.getElementById('sponsors-container');
        // if (sponsorsContainer) {
        //     sponsorsContainer.classList.remove('visible');
        // }
    }
    
    drawCircle() {
        // Solo dibujar el círculo si estamos en la sección home
        if (!this.isHomeSection) return;
        
        if (this.sponsorsVisible || this.circleOpacity <= 0) return;
        
        // Actualizar posiciones de las partículas del círculo (borde)
        this.updateCircleParticlesPosition();
        
        // Actualizar posiciones de las partículas internas
        if (!this.explosionActive) {
            this.updateInnerParticlesPosition();
        }
        
        // Dibujar partículas internas primero (fondo)
        this.drawInnerParticles();
        
        // Dibujar círculo hecho de partículas (borde)
        this.drawCircleParticles();
        
        // Dibujar logo en el centro (solo si el círculo es visible)
        if (this.circleOpacity > 0.3) {
            this.drawLogo();
        }
    }
    
    drawCircleParticles() {
        this.ctx.save();
        this.ctx.globalAlpha = this.circleOpacity;
        
        // Durante la explosión, reducir el tamaño del círculo gradualmente
        let currentRadius = this.circleRadius;
        
        if (this.explosionActive) {
            const shrinkFactor = 1 - this.explosionProgress;
            currentRadius = this.circleRadius * (0.3 + shrinkFactor * 0.7);
        }
        
        // Actualizar radio base de las partículas
        this.circleParticles.forEach(p => {
            if (!p.exploded) {
                p.baseRadius = currentRadius;
            }
        });
        
        // Dibujar cada partícula del círculo
        this.circleParticles.forEach((p, index) => {
            if (p.exploded) {
                // Si está en explosión, usar física de explosión
                p.x += p.velocityX;
                p.y += p.velocityY;
                p.velocityX *= 0.98;
                p.velocityY *= 0.98;
                p.opacity = Math.max(0, p.opacity - 0.02);
            }
            
            if (p.opacity <= 0) return;
            
            this.ctx.save();
            this.ctx.globalAlpha = p.opacity * this.circleOpacity;
            
            // Dibujar partícula del círculo con resplandor mejorado
            const glowRadius = p.size * 3 * (p.glowIntensity || 1);
            const gradient = this.ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, glowRadius
            );
            
            // Gradiente más suave y con mejor resplandor
            const centerOpacity = Math.min(1, p.opacity * 1.2);
            const midOpacity = p.opacity * 0.6;
            gradient.addColorStop(0, `hsla(${p.hue}, 85%, 75%, ${centerOpacity})`);
            gradient.addColorStop(0.4, `hsla(${p.hue}, 80%, 65%, ${midOpacity})`);
            gradient.addColorStop(0.7, `hsla(${p.hue}, 75%, 60%, ${p.opacity * 0.3})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 70%, 55%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, glowRadius * 0.6, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Núcleo brillante más pequeño en el centro
            const coreGradient = this.ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, p.size
            );
            coreGradient.addColorStop(0, `hsla(${p.hue}, 90%, 85%, ${centerOpacity})`);
            coreGradient.addColorStop(1, `hsla(${p.hue}, 85%, 75%, 0)`);
            this.ctx.fillStyle = coreGradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dibujar conexiones entre partículas adyacentes y cercanas para formar el círculo
            if (!p.exploded && !this.explosionActive) {
                // Conexión con partícula adyacente
                const nextIndex = (index + 1) % this.circleParticles.length;
                const nextP = this.circleParticles[nextIndex];
                
                if (!nextP.exploded) {
                    const distance = Math.sqrt(
                        Math.pow(nextP.x - p.x, 2) + 
                        Math.pow(nextP.y - p.y, 2)
                    );
                    
                    // Conexión más suave con gradiente de opacidad basado en distancia
                    if (distance < 60) {
                        const maxDistance = 60;
                        const opacityFactor = 1 - (distance / maxDistance);
                        const lineOpacity = opacityFactor * 0.4 * this.circleOpacity * Math.min(p.opacity, nextP.opacity);
                        
                        this.ctx.strokeStyle = `hsla(${(p.hue + nextP.hue) / 2}, 70%, 65%, ${lineOpacity})`;
                        this.ctx.lineWidth = 0.8;
                        this.ctx.beginPath();
                        this.ctx.moveTo(p.x, p.y);
                        this.ctx.lineTo(nextP.x, nextP.y);
                        this.ctx.stroke();
                    }
                }
            }
            
            this.ctx.restore();
        });
        
        // Efecto de ondas durante la explosión
        if (this.explosionActive && this.explosionProgress < 0.5) {
            const waveCount = 3;
            for (let i = 0; i < waveCount; i++) {
                const waveProgress = (this.explosionProgress * 2) + (i * 0.2);
                if (waveProgress <= 1) {
                    const waveRadius = currentRadius + waveProgress * 200;
                    const waveOpacity = (1 - waveProgress) * 0.3 * this.circleOpacity;
                    
                    this.ctx.strokeStyle = `rgba(139, 92, 246, ${waveOpacity})`;
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(this.circleCenter.x, this.circleCenter.y, waveRadius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        }
        
        this.ctx.restore();
    }
    
    drawLogo() {
        const logoSize = this.circleRadius * 0.5; // Logo más pequeño y minimalista
        
        if (this.logoImage && this.logoImage.complete) {
            // Si hay imagen de logo, dibujarla con estilo minimalista
            this.ctx.save();
            
            // Opacidad basada en la opacidad del círculo
            this.ctx.globalAlpha = this.circleOpacity * 0.95;
            
            // Efecto de resplandor sutil alrededor del logo
            const glowGradient = this.ctx.createRadialGradient(
                this.circleCenter.x, this.circleCenter.y, logoSize * 0.3,
                this.circleCenter.x, this.circleCenter.y, logoSize * 0.8
            );
            glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.2)');
            glowGradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.circleCenter.x, this.circleCenter.y, logoSize * 0.8, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Dibujar el logo
            const imgSize = logoSize;
            this.ctx.drawImage(
                this.logoImage,
                this.circleCenter.x - imgSize / 2,
                this.circleCenter.y - imgSize / 2,
                imgSize,
                imgSize
            );
            
            this.ctx.restore();
        }
    }
    
    updateParticles() {
        this.particles.forEach(p => {
            // Si la partícula está en explosión, usar física de explosión
            if (p.exploded) {
                // Aplicar velocidad de explosión
                p.x += p.velocityX;
                p.y += p.velocityY;
                
                // Aplicar fricción suave para que se desacelere
                p.velocityX *= 0.98;
                p.velocityY *= 0.98;
                
                // Reducir opacidad gradualmente durante la explosión
                p.explosionFade = Math.max(0, p.explosionFade - 0.008);
                p.opacity = (Math.random() * 0.5 + 0.2) * p.explosionFade;
                
                // Si la velocidad es muy baja, cambiar a movimiento normal
                if (Math.abs(p.velocityX) < 0.1 && Math.abs(p.velocityY) < 0.1) {
                    // Continuar moviéndose hacia el objetivo pero más lento
                    const dx = p.targetX - p.x;
                    const dy = p.targetY - p.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance > 1) {
                        p.x += (dx / distance) * 0.5;
                        p.y += (dy / distance) * 0.5;
                    }
                }
            } else {
                // Movimiento suave hacia el objetivo (comportamiento normal)
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 1) {
                    const speed = p.scattered ? p.scatterSpeed : p.speed;
                    p.x += (dx / distance) * speed;
                    p.y += (dy / distance) * speed;
                }
            }
            
            // Si está en el círculo, mantener movimiento orbital suave
            if (p.inCircle && !p.scattered) {
                p.angle += 0.0015 + (p.speed * 0.001);
                const baseX = this.circleCenter.x + Math.cos(p.angle) * p.distance;
                const baseY = this.circleCenter.y + Math.sin(p.angle) * p.distance;
                
                // Interpolar hacia la posición base solo si no hay influencia del mouse
                if (!this.mouseNearCircle) {
                    p.targetX = baseX;
                    p.targetY = baseY;
                } else {
                    // Suavizar el movimiento hacia el objetivo
                    p.targetX += (baseX - p.targetX) * 0.05;
                    p.targetY += (baseY - p.targetY) * 0.05;
                }
            }
        });
    }
    
    drawInnerParticles() {
        this.ctx.save();
        this.ctx.globalAlpha = this.circleOpacity;
        
        this.innerParticles.forEach(p => {
            if (p.exploded) {
                // Si está en explosión, usar física de explosión
                p.x += p.velocityX;
                p.y += p.velocityY;
                p.velocityX *= 0.98;
                p.velocityY *= 0.98;
                p.opacity = Math.max(0, p.opacity - 0.015);
            }
            
            if (p.opacity <= 0) return;
            
            this.ctx.save();
            this.ctx.globalAlpha = p.opacity * this.circleOpacity;
            
            // Dibujar partícula interna con resplandor
            const glowRadius = p.size * 2.5 * (p.glowIntensity || 1);
            const gradient = this.ctx.createRadialGradient(
                p.x, p.y, 0,
                p.x, p.y, glowRadius
            );
            
            const centerOpacity = Math.min(1, p.opacity * 1.1);
            gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${centerOpacity})`);
            gradient.addColorStop(0.5, `hsla(${p.hue}, 75%, 65%, ${p.opacity * 0.5})`);
            gradient.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, glowRadius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            // Si el círculo está oculto y la partícula está en el círculo, ocultarla también
            if (p.inCircle && !p.scattered && !p.exploded && this.circleOpacity <= 0) {
                return;
            }
            
            // Dibujar partícula
            this.ctx.save();
            
            // Aplicar opacidad del círculo a las partículas que están dentro
            let particleAlpha = p.opacity;
            if (p.inCircle && !p.scattered && !p.exploded) {
                particleAlpha *= this.circleOpacity;
            } else if (p.exploded) {
                // Las partículas en explosión usan su propia opacidad que ya incluye explosionFade
                particleAlpha = p.opacity;
            }
            
            this.ctx.globalAlpha = particleAlpha;
            
            // Durante la explosión, hacer las partículas más brillantes y grandes
            let particleRadius = p.radius;
            let brightness = 60;
            
            if (p.exploded) {
                // Partículas en explosión son más grandes y brillantes
                particleRadius = p.radius * (1.5 + (1 - p.explosionFade) * 0.5);
                brightness = 70 + (1 - p.explosionFade) * 20; // Más brillantes al inicio
            }
            
            const gradient = this.ctx.createRadialGradient(
                p.x, p.y, 0, 
                p.x, p.y, particleRadius * 2
            );
            gradient.addColorStop(0, `hsla(${p.hue}, 70%, ${brightness}%, 1)`);
            gradient.addColorStop(1, `hsla(${p.hue}, 70%, ${brightness}%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, particleRadius, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
        
        // Dibujar líneas de conexión entre partículas cercanas
        if (!this.sponsorsVisible) {
            for (let i = 0; i < this.particles.length; i++) {
                for (let j = i + 1; j < this.particles.length; j++) {
                    const p1 = this.particles[i];
                    const p2 = this.particles[j];
                    
                    if (p1.inCircle && p2.inCircle) {
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 120) {
                            this.ctx.save();
                            this.ctx.globalAlpha = (120 - distance) / 120 * 0.3;
                            this.ctx.strokeStyle = `hsla(${p1.hue}, 70%, 60%, 0.3)`;
                            this.ctx.lineWidth = 0.5;
                            this.ctx.beginPath();
                            this.ctx.moveTo(p1.x, p1.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.stroke();
                            this.ctx.restore();
                        }
                    }
                }
            }
        }
    }
    
    checkCurrentSection() {
        // Verificar qué sección está activa
        const homeSection = document.getElementById('section-home');
        if (homeSection && !homeSection.classList.contains('hidden')) {
            if (!this.isHomeSection) {
                // Acabamos de cambiar a home, restaurar el círculo
                this.isHomeSection = true;
                this.circleOpacity = 1;
                this.explosionActive = false;
                this.explosionTriggered = false;
                this.explosionProgress = 0;
                // Recolectar partículas del círculo
                this.collectParticles();
            }
        } else {
            if (this.isHomeSection) {
                // Acabamos de salir de home, ocultar el círculo
                this.isHomeSection = false;
                // Dispersar todas las partículas del círculo
                this.triggerExplosion();
                this.circleOpacity = 0;
            }
        }
    }
    
    observeSectionChanges() {
        // Observar cambios en las secciones usando MutationObserver
        const observer = new MutationObserver(() => {
            this.checkCurrentSection();
        });
        
        // Observar cambios en las secciones
        const homeSection = document.getElementById('section-home');
        if (homeSection) {
            observer.observe(homeSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        }
        
        // También verificar periódicamente
        setInterval(() => this.checkCurrentSection(), 200);
        
        // Verificar al hacer clic en botones de navegación
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => this.checkCurrentSection(), 100);
            });
        });
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Actualizar posición del círculo constantemente para suavizar la animación
        this.updateCirclePosition();
        
        this.updateParticles();
        this.drawCircle(); // Dibuja círculo (borde), partículas internas y logo (solo si está en home)
        this.drawParticles(); // Dibuja partículas normales
        
        requestAnimationFrame(() => this.animate());
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.morphoParticles = new MorphoParticles('morpho-canvas');
});

