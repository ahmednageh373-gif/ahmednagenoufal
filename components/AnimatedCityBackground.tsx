/**
 * Animated City Background - Inspired by km2.ai
 * خلفية المباني المتحركة والمضيئة
 */

import React, { useEffect, useRef } from 'react';

interface AnimatedCityBackgroundProps {
    className?: string;
    speed?: number; // سرعة الحركة (1-10)
    buildingCount?: number; // عدد المباني
    lightIntensity?: number; // شدة الإضاءة (0-1)
}

export const AnimatedCityBackground: React.FC<AnimatedCityBackgroundProps> = ({
    className = '',
    speed = 3,
    buildingCount = 15,
    lightIntensity = 0.7
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Building class
        class Building {
            x: number;
            y: number;
            width: number;
            height: number;
            windowRows: number;
            windowCols: number;
            windows: boolean[][];
            color: string;
            lightColor: string;
            flickerSpeed: number;

            constructor(x: number, canvasHeight: number) {
                this.x = x;
                this.width = 40 + Math.random() * 60; // 40-100px width
                this.height = 150 + Math.random() * 300; // 150-450px height
                this.y = canvasHeight - this.height;
                this.windowRows = Math.floor(this.height / 25);
                this.windowCols = Math.floor(this.width / 15);
                this.windows = [];
                this.color = `rgba(${20 + Math.random() * 30}, ${20 + Math.random() * 30}, ${30 + Math.random() * 40}, 0.9)`;
                this.lightColor = Math.random() > 0.5 ? '#FFE4B5' : '#87CEEB';
                this.flickerSpeed = 0.001 + Math.random() * 0.005;

                // Initialize windows
                for (let row = 0; row < this.windowRows; row++) {
                    this.windows[row] = [];
                    for (let col = 0; col < this.windowCols; col++) {
                        this.windows[row][col] = Math.random() > 0.3; // 70% lit
                    }
                }
            }

            update() {
                // Flicker windows randomly
                if (Math.random() < this.flickerSpeed) {
                    const row = Math.floor(Math.random() * this.windowRows);
                    const col = Math.floor(Math.random() * this.windowCols);
                    this.windows[row][col] = !this.windows[row][col];
                }
            }

            draw(ctx: CanvasRenderingContext2D) {
                // Draw building body
                ctx.fillStyle = this.color;
                ctx.fillRect(this.x, this.y, this.width, this.height);

                // Draw windows
                const windowWidth = (this.width - 10) / this.windowCols;
                const windowHeight = 15;
                const spacing = 5;

                for (let row = 0; row < this.windowRows; row++) {
                    for (let col = 0; col < this.windowCols; col++) {
                        if (this.windows[row][col]) {
                            const windowX = this.x + spacing + col * windowWidth;
                            const windowY = this.y + spacing + row * (windowHeight + spacing);

                            // Window glow
                            const gradient = ctx.createRadialGradient(
                                windowX + windowWidth / 2,
                                windowY + windowHeight / 2,
                                0,
                                windowX + windowWidth / 2,
                                windowY + windowHeight / 2,
                                windowWidth * 1.5
                            );
                            gradient.addColorStop(0, this.lightColor);
                            gradient.addColorStop(1, 'transparent');
                            ctx.fillStyle = gradient;
                            ctx.fillRect(
                                windowX - windowWidth / 2,
                                windowY - windowHeight / 2,
                                windowWidth * 2,
                                windowHeight * 2
                            );

                            // Window itself
                            ctx.fillStyle = this.lightColor;
                            ctx.fillRect(windowX, windowY, windowWidth - spacing, windowHeight);
                        }
                    }
                }

                // Building top highlight
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.fillRect(this.x, this.y, this.width, 3);
            }
        }

        // Create buildings
        const buildings: Building[] = [];
        const spacing = canvas.width / buildingCount;
        for (let i = 0; i < buildingCount; i++) {
            buildings.push(new Building(i * spacing + Math.random() * 20, canvas.height));
        }

        // Stars in background
        const stars: { x: number; y: number; size: number; opacity: number }[] = [];
        for (let i = 0; i < 100; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height * 0.6,
                size: Math.random() * 2,
                opacity: Math.random()
            });
        }

        // Parallax layers
        let offset = 0;

        // Animation loop
        let animationId: number;
        const animate = () => {
            // Clear canvas with dark sky gradient
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0a0e1a');
            gradient.addColorStop(0.6, '#1a1f2e');
            gradient.addColorStop(1, '#2a2f3e');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            stars.forEach(star => {
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();

                // Twinkling effect
                star.opacity += (Math.random() - 0.5) * 0.1;
                star.opacity = Math.max(0.2, Math.min(1, star.opacity));
            });

            // Update and draw buildings
            buildings.forEach(building => {
                building.update();
                building.draw(ctx);
            });

            // Parallax scroll effect
            offset += speed * 0.1;
            if (offset > canvas.width) offset = 0;

            animationId = requestAnimationFrame(animate);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationId);
        };
    }, [speed, buildingCount, lightIntensity]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 -z-10 ${className}`}
            style={{ width: '100%', height: '100%' }}
        />
    );
};

export default AnimatedCityBackground;
