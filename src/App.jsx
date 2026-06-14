import React, { useRef, useEffect, useState } from "react";
import './App.css';

function Game() {

  useEffect(() => {
    document.title = "My Game";
  }, []);

  const canvasRef = useRef(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);

  //image
  const screamerImage = new Image();
  screamerImage.src = "./public/screamer-girl.png";

  //timer 
  const [timeLeft, setTimeLeft] = useState(60);
const timeLeftRef = useRef(timeLeft);
useEffect(() => {
  timeLeftRef.current = timeLeft;
}, [timeLeft]);
  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);




  // Player properties
  const playerRef = useRef({ x: 50, y: 150, width: 30, height: 30, speed: 5 });
  const keysRef = useRef({ up: false, down: false });

  // Enemies
  const enemiesRef = useRef([]);
  // Score ref for closures
  const scoreRef = useRef(0);
  useEffect(() => { scoreRef.current = score; }, [score]);

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    const spawnEnemy = () => {
      enemiesRef.current.push({
        x: canvas.width,
        y: Math.random() * (canvas.height - 30),
        width: 30,
        height: 30,
        speed: 3,
      });
    };

    const detectCollision = (rect1, rect2) => {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const player = playerRef.current;
      const keys = keysRef.current;

      // Update player position smoothly based on keys
      if (keys.up) player.y -= player.speed;
      if (keys.down) player.y += player.speed;
      
      // Prevent player from moving out of canvas bounds
      player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));

      // Draw player
      ctx.fillStyle = "blue";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Move and draw enemies
      ctx.fillStyle = "red";
      enemiesRef.current.forEach((enemy, index) => {
        enemy.x -= enemy.speed;
        ctx.beginPath();
        ctx.moveTo(enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.1);
        ctx.lineTo(enemy.x + enemy.width * 0.85, enemy.y + enemy.height * 0.15);
        ctx.lineTo(enemy.x + enemy.width * 0.95, enemy.y + enemy.height * 0.5);
        ctx.lineTo(enemy.x + enemy.width * 0.75, enemy.y + enemy.height * 0.85);
        ctx.lineTo(enemy.x + enemy.width * 0.45, enemy.y + enemy.height * 0.95);
        ctx.lineTo(enemy.x + enemy.width * 0.15, enemy.y + enemy.height * 0.75);
        ctx.lineTo(enemy.x + enemy.width * 0.05, enemy.y + enemy.height * 0.45);
        ctx.lineTo(enemy.x + enemy.width * 0.2, enemy.y + enemy.height * 0.15);
        ctx.closePath();
        ctx.fill();

        // Collision check
        if (detectCollision(player, enemy)) {
          setRunning(false);

          ctx.fillStyle = "white";
          ctx.font = "30px Arial";
          ctx.textAlign = "center";
          ctx.fillText("Game Over! Final Score: " + scoreRef.current, canvas.width / 2, canvas.height / 2);

        }

        // Remove off-screen enemies
        if (enemy.x + enemy.width < 0) {
          enemiesRef.current.splice(index, 1);
          setScore((prev) => prev + 1);
        }
      });

      ctx.fillStyle = "white";
      ctx.font = "30px Arial";
      ctx.textAlign = "right";
      ctx.fillText("Time Left: " + timeLeftRef.current, canvas.width - 10, 30);

      if (running) {
        animationFrameId = requestAnimationFrame(gameLoop);
      }
    };

    if (running) {
      spawnEnemy();
      animationFrameId = requestAnimationFrame(gameLoop);
      const enemyInterval = setInterval(spawnEnemy, 2000);
      return () => {
        cancelAnimationFrame(animationFrameId);
        clearInterval(enemyInterval);
      };
    }
  }, [running]);

  // Player controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keysRef.current.up = true;
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keysRef.current.down = true;
    };

    const handleKeyUp = (e) => {
      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") keysRef.current.up = false;
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") keysRef.current.down = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <h1>Score: {score}</h1>
    
      <canvas ref={canvasRef} width={500} height={300} style={{ border: "1px solid black" }} />

      {timeLeft <= 0 && (
        <>
         <img 
          src={screamerImage.src} 
          alt="Jumpscare"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 9999,
            objectFit: "cover"
          }}
        />
        <audio src="./public/harold-screamer.mp3" autoPlay></audio>
        </>
       

      )}

      <div>
        <button onClick={() => { setScore(0); setTimeLeft(60); enemiesRef.current = []; playerRef.current.y = 150; setRunning(true); }}>Start</button>
        <button onClick={() => setRunning(false)}>Pause</button>

        <button onClick={() => {
          setRunning(false);
          setScore(0);
          setTimeLeft(60);
          timeLeftRef.current = 60; 
          enemiesRef.current = [];
          playerRef.current.y = 150;
          const canvas = canvasRef.current;
          if (canvas) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }}>Reset</button>

      </div>

     
      <footer style={{ textAlign: "center", marginTop: "20px" }}>
        © 2026 Made by Zenand Sala
      </footer>
    

    </div>

    
  );
}

export default Game;
