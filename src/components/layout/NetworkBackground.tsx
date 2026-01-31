import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulsePhase: number;
}

interface Packet {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

// Pastel colors for the light theme
const COLORS = {
  lightBlue: { r: 91, g: 155, b: 213 },      // #5B9BD5
  lightPurple: { r: 155, g: 120, b: 185 },   // #9B78B9
  lightBrown: { r: 180, g: 140, b: 100 },    // #B48C64
};

export function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const nodesRef = useRef<Node[]>([]);
  const packetsRef = useRef<Packet[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize nodes
    const nodeCount = 25;
    nodesRef.current = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: 2 + Math.random() * 2,
      pulsePhase: Math.random() * Math.PI * 2,
    }));

    // Initialize data packets
    packetsRef.current = [];

    const addPacket = () => {
      if (nodesRef.current.length < 2) return;
      const from = Math.floor(Math.random() * nodesRef.current.length);
      let to = Math.floor(Math.random() * nodesRef.current.length);
      while (to === from) to = Math.floor(Math.random() * nodesRef.current.length);
      
      packetsRef.current.push({
        fromNode: from,
        toNode: to,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
      });
    };

    // Add packets periodically
    const packetInterval = setInterval(addPacket, 800);

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const nodes = nodesRef.current;
      const packets = packetsRef.current;

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Move node
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        // Keep in bounds
        node.x = Math.max(0, Math.min(canvas.width, node.x));
        node.y = Math.max(0, Math.min(canvas.height, node.y));

        // Draw connections to nearby nodes - light blue
        nodes.forEach((other, j) => {
          if (i >= j) return;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 200) {
            const opacity = (1 - dist / 200) * 0.12;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(${COLORS.lightBlue.r}, ${COLORS.lightBlue.g}, ${COLORS.lightBlue.b}, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });

        // Draw node with pulse - light purple
        const pulse = Math.sin(time * 0.002 + node.pulsePhase) * 0.5 + 0.5;
        const radius = node.radius + pulse * 1.5;
        
        // Glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
        gradient.addColorStop(0, `rgba(${COLORS.lightPurple.r}, ${COLORS.lightPurple.g}, ${COLORS.lightPurple.b}, ${0.25 * pulse})`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(node.x - radius * 4, node.y - radius * 4, radius * 8, radius * 8);

        // Core
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${COLORS.lightBlue.r}, ${COLORS.lightBlue.g}, ${COLORS.lightBlue.b}, ${0.5 + pulse * 0.3})`;
        ctx.fill();
      });

      // Update and draw packets - light brown/tan
      packetsRef.current = packets.filter((packet) => {
        packet.progress += packet.speed;
        
        if (packet.progress >= 1) return false;

        const from = nodes[packet.fromNode];
        const to = nodes[packet.toNode];
        if (!from || !to) return false;

        const x = from.x + (to.x - from.x) * packet.progress;
        const y = from.y + (to.y - from.y) * packet.progress;

        // Draw packet with trail
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 8);
        gradient.addColorStop(0, `rgba(${COLORS.lightBrown.r}, ${COLORS.lightBrown.g}, ${COLORS.lightBrown.b}, 0.7)`);
        gradient.addColorStop(0.5, `rgba(${COLORS.lightPurple.r}, ${COLORS.lightPurple.g}, ${COLORS.lightPurple.b}, 0.4)`);
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect(x - 8, y - 8, 16, 16);

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${COLORS.lightBrown.r}, ${COLORS.lightBrown.g}, ${COLORS.lightBrown.b})`;
        ctx.fill();

        return true;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      clearInterval(packetInterval);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-50"
      />
      {/* Hexagonal overlay */}
      <div className="absolute inset-0 hex-grid" />
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 circuit-pattern opacity-20" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
    </div>
  );
}
