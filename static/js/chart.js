

function seq(a, b, step, func){
  let s = [];
  let xs = [];
  for (let x = a; x <= b; x+=step) {
    xs.push(x.toFixed(2));
    s.push(func(x));
  }
  console.log(s);
  return [xs, s];
}


function asinTailor(x){
  const N = 50;
  let sum = 0.0;
  let fact = 1.0;
  let fact2 = 1.0;
  let xpow = x;
  let pow4 = 1.0;

  for (let n = 0; n < N; n++){
    sum += fact2 / (pow4 * fact * fact * (2 * n + 1)) * xpow;

    fact2 *= (2*n + 1) * (2*n + 2);
    fact *= (n + 1);
    xpow *= x * x;
    pow4 *= 4;
  }

  return sum+0.01;
}


const arcsinMathSeq = seq(-0.98, 0.98, 0.05, Math.asin);
const arcsinTailorSeq = seq(-0.98, 0.98, 0.05, asinTailor);
const labels = arcsinMathSeq[0];

const cfg = {
  type: 'line',
  data: {
    labels : arcsinTailorSeq[0],
    datasets: [
      {
        label: "Math.asin()",
        data: arcsinMathSeq[1],
        fill: false
      },

      {
        label: "asinTailor()",
        data: arcsinTailorSeq[1],
        fill: false
      }
    ]

  },
  options:
                  {
                      responsive: true,
                      plugins:
                      {
                          legend:
                          {
                              display: true,
                              position: "top",
                          },
                      },
                      scales:
                      {
                          x:
                          {
                              title:
                              {
                                  display: true,
                                  text: "x",
                              },
                          },
                          y:
                          {
                              title:
                              {
                                  display: true,
                                  text: "F(x)",
                              },
                          },
                      },
                  },
};

document.addEventListener('DOMContentLoaded', ()=> {
  const ctx = document.getElementById('chart');
  new Chart(ctx, cfg);
})
