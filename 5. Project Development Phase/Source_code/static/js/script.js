console.log("SCRIPT LOADED");

document.addEventListener("DOMContentLoaded", function () {
    console.log(document.getElementById("historyBox"));
    console.log(document.getElementById("loading"));
    console.log(document.getElementById("result"));

    const form = document.getElementById("predictionForm");
    const result = document.getElementById("result");
    const predictionValue = document.getElementById("predictionValue");
    const button = document.getElementById("predictBtn");
    const resetBtn = document.getElementById("resetBtn");

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        button.disabled = true;
        button.innerHTML = "Predicting...";

        const formData = new FormData(form);

        try {

            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.error) {
                button.disabled = false;
                button.innerHTML = "Predict Flood Risk";
                alert(data.error);
                return;
            } else {
    
                const probability = (data.prediction * 100).toFixed(2);


            let color = "";

            if (data.risk === "Low") {
                color = "#16a34a";
            }
            else if (data.risk === "Moderate") {
                color = "#f59e0b";
            }
            else {
                color = "#dc2626";
            }

            predictionValue.innerHTML = `
                ${probability}%<br>
                <span style="font-size:24px; color:${color}; font-weight:bold;">
                    ${data.risk.toUpperCase()} FLOOD RISK
                </span>
            `;

            // Show safety recommendations
            const adviceList = document.getElementById("adviceList");
            adviceList.innerHTML = "";

            data.advice.forEach(function(item) {
                adviceList.innerHTML += `
                <li>${item}</li>
                `;
            });

            result.style.display = "block";
            
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong!");
        } finally {
            button.disabled = false;
            button.innerHTML = "Predict Flood Risk";
        }
        

    });

resetBtn.addEventListener("click", function () {

    // Clear all input fields
    form.reset();

    // Hide prediction result
    result.style.display = "none";

    // Hide loading animation
    document.getElementById("loading").style.display = "none";

    // Clear prediction text
    predictionValue.innerHTML = "";

    // Clear safety recommendations
    document.getElementById("adviceList").innerHTML = "";

    // Scroll back to top smoothly
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});

    /* ===========================
   LIVE RAIN EFFECT
=========================== */

const canvas = document.getElementById("rainCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drops = [];

for (let i = 0; i < 450; i++) {
    drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        l: Math.random() * 20 + 10,
        xs: -2,
        ys: Math.random() * 10 + 12
    });
}

function drawRain() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 1;

    for (let i = 0; i < drops.length; i++) {

        let d = drops[i];

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x + d.xs, d.y + d.l);
        ctx.stroke();

    }

    moveRain();

    requestAnimationFrame(drawRain);

}

function moveRain() {

    for (let i = 0; i < drops.length; i++) {

        let d = drops[i];

        d.x += d.xs;
        d.y += d.ys;

        if (d.y > canvas.height) {

            d.y = -20;
            d.x = Math.random() * canvas.width;

        }

    }

}

window.addEventListener("resize", function () {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});

drawRain();


});
