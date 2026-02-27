import Header from '../components/Header';

export default function Documentation() {
  const sections = [
    {
      title: 'Getting Started',
      icon: '🚀',
      items: [
        {
          name: 'What is Noesis?',
          description: 'Interactive platform for exploring physics and mathematics through real-time simulations',
          link: '#what-is-noesis'
        },
        {
          name: 'Quick Start Guide',
          description: 'Learn the basics and start experimenting with simulations in minutes',
          link: '#quick-start'
        },
        {
          name: 'Navigation',
          description: 'Understand the interface and find your way around the platform',
          link: '#navigation'
        }
      ]
    },
    {
      title: 'Physics Simulations',
      icon: '⚛️',
      items: [
        {
          name: 'Kinematics',
          description: 'Projectile motion with velocity, angle, and air resistance controls',
          link: '/projectile'
        },
        {
          name: 'Energy & Oscillations',
          description: 'Pendulum simulation demonstrating SHM and energy conservation',
          link: '/pendulum'
        },
        {
          name: 'Momentum',
          description: 'Elastic and inelastic collisions with conservation laws',
          link: '/collision'
        },
        {
          name: 'Fluids',
          description: 'Pascal\'s law and hydraulic pressure transmission',
          link: '/pascals-law'
        }
      ]
    },
    {
      title: 'Features',
      icon: '✨',
      items: [
        {
          name: 'Real-Time Physics',
          description: 'All simulations run in real-time with accurate physics calculations',
          link: '#real-time'
        },
        {
          name: 'Customizable Parameters',
          description: 'Adjust variables to see how they affect the simulation behavior',
          link: '#parameters'
        },
        {
          name: 'Visual Feedback',
          description: 'Graphs, vectors, and trails help visualize complex physics concepts',
          link: '#visuals'
        },
        {
          name: 'Educational Content',
          description: 'Each simulation includes explanations of the underlying physics',
          link: '#education'
        }
      ]
    },
    {
      title: 'Math Graphing Calculator',
      icon: '📐',
      items: [
        {
          name: 'Basic Functions',
          description: 'Plot functions like sin(x), x^2, |x|. Press Enter to render',
          link: '/math'
        },
        {
          name: 'Implicit Equations',
          description: 'Plot curves like x^2 + y^2 = 5, heart curve: (x^2 + y^2 - 1)^3 = x^2 * y^3',
          link: '/math'
        },
        {
          name: 'Inequalities',
          description: 'Shade regions: y <= x^2, x^2 + y^2 < 9, max(x,y) >= 2',
          link: '/math'
        },
        {
          name: 'Points & Shapes',
          description: 'Create points a=(2,3), shapes circle(5), ellipse(3,2), hyperbola(2,1)',
          link: '/math'
        },
        {
          name: 'Parameters & Sliders',
          description: 'Use variables a,b,c in equations - automatic sliders appear',
          link: '/math'
        },
        {
          name: 'Function Reference',
          description: 'Complete list of all supported mathematical functions',
          link: '#math-functions'
        }
      ]
    },
    {
      title: 'Technical Details',
      icon: '🔧',
      items: [
        {
          name: 'Rendering',
          description: 'Canvas-based rendering for smooth 60fps animations',
          link: '#rendering'
        },
        {
          name: 'Physics Engine',
          description: 'Custom physics calculations using numerical integration methods',
          link: '#physics-engine'
        },
        {
          name: 'Performance',
          description: 'Optimized for both desktop and mobile devices',
          link: '#performance'
        }
      ]
    },
    {
      title: 'Further Documentation',
      icon: '⚛️',
      items: [
        {
          name: 'Pendulum',
          description: 'The derivation of equation of motion from first principles',
          link: '/documentation/pendulum_docs'
        },
        {
          name: 'Projectile Motion',
          description: 'Derivation of basic equation of motion (Parabolic) from first principles',
          link: '/documentation/projectile_docs'
        },
        {
          name: 'Electromagnetism',
          description: 'Derivation of relativistic electromagnetic field effect from PLA',
          link: '/documentation/electromagnetism_docs'
        }
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200">
      <Header />
      
      <main className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Documentation
            </h1>
            <p className="text-lg text-neutral-400 max-w-3xl">
              Everything you need to know about using Noesis. Explore interactive physics and mathematics simulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sections.map((section, idx) => (
              <div key={idx} className="bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-8 hover:border-neutral-700 transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-pink-500/20 flex items-center justify-center text-2xl">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-100">{section.title}</h2>
                </div>
                
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <a
                      key={itemIdx}
                      href={item.link}
                      className="block p-4 rounded-lg bg-neutral-800/30 hover:bg-neutral-800/60 border border-neutral-700/50 hover:border-neutral-600 transition-all group"
                    >
                      <h3 className="font-semibold text-neutral-100 mb-1 group-hover:text-pink-400 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-sm text-neutral-400">{item.description}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-100">Learn by Doing</h3>
              <p className="text-sm text-neutral-400">
                Interact with simulations to build intuition about physics concepts
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-100">Experiment Freely</h3>
              <p className="text-sm text-neutral-400">
                No wrong answers - adjust parameters and see what happens
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔬</div>
              <h3 className="text-lg font-semibold mb-2 text-neutral-100">Real Physics</h3>
              <p className="text-sm text-neutral-400">
                All simulations based on actual physics equations and principles
              </p>
            </div>
          </div>

          {/* Math Function Reference */}
          <div id="math-functions" className="mt-16 bg-neutral-900/50 backdrop-blur border border-neutral-800 rounded-2xl p-8">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Math Function Reference
            </h2>
            
            {/* Syntax Guide */}
            <div className="mb-8 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <span>✍️</span> Syntax Guide
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-pink-400 mb-2">Basic Functions</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">x^2</span> - Quadratic</li>
                    <li>• <span className="text-purple-400">sin(x)</span> - Sine wave</li>
                    <li>• <span className="text-purple-400">|x|</span> or <span className="text-purple-400">abs(x)</span> - Absolute value</li>
                    <li>• <span className="text-purple-400">a*sin(b*x)</span> - Parametric (sliders auto-appear)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-400 mb-2">Implicit Equations</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">x^2 + y^2 = 25</span> - Circle</li>
                    <li>• <span className="text-purple-400">(x/a)^2 + (y/b)^2 = 1</span> - Ellipse</li>
                    <li>• <span className="text-purple-400">(x^2 + y^2 - 1)^3 = x^2*y^3</span> - Heart</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-400 mb-2">Inequalities (Shaded)</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">y &lt;= x^2</span> - Parabola region</li>
                    <li>• <span className="text-purple-400">x^2 + y^2 &lt; 9</span> - Circle interior</li>
                    <li>• <span className="text-purple-400">|x| + |y| &gt;= 2</span> - Diamond exterior</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-pink-400 mb-2">Points & Shortcuts</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">a = (2, 3)</span> - Create point</li>
                    <li>• <span className="text-purple-400">circle(5)</span> - Circle radius 5</li>
                    <li>• <span className="text-purple-400">ellipse(3, 2)</span> - Ellipse</li>
                    <li>• <span className="text-purple-400">heart</span> - Heart curve</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Function Categories */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Trigonometric */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>📊</span> Trigonometric
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">sin(x)</span> - Sine</div>
                  <div><span className="text-purple-400">cos(x)</span> - Cosine</div>
                  <div><span className="text-purple-400">tan(x)</span> - Tangent</div>
                  <div><span className="text-purple-400">sec(x)</span> - Secant</div>
                  <div><span className="text-purple-400">csc(x)</span> - Cosecant</div>
                  <div><span className="text-purple-400">cot(x)</span> - Cotangent</div>
                </div>
              </div>

              {/* Inverse Trigonometric */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>↩️</span> Inverse Trig
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">asin(x)</span> - Arc sine</div>
                  <div><span className="text-purple-400">acos(x)</span> - Arc cosine</div>
                  <div><span className="text-purple-400">atan(x)</span> - Arc tangent</div>
                  <div><span className="text-purple-400">atan2(y,x)</span> - 2-arg arctangent</div>
                  <div><span className="text-purple-400">asec(x)</span> - Arc secant</div>
                  <div><span className="text-purple-400">acsc(x)</span> - Arc cosecant</div>
                  <div><span className="text-purple-400">acot(x)</span> - Arc cotangent</div>
                </div>
              </div>

              {/* Hyperbolic */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>〰️</span> Hyperbolic
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">sinh(x)</span> - Hyperbolic sine</div>
                  <div><span className="text-purple-400">cosh(x)</span> - Hyperbolic cosine</div>
                  <div><span className="text-purple-400">tanh(x)</span> - Hyperbolic tangent</div>
                  <div><span className="text-purple-400">sech(x)</span> - Hyperbolic secant</div>
                  <div><span className="text-purple-400">csch(x)</span> - Hyperbolic cosecant</div>
                  <div><span className="text-purple-400">coth(x)</span> - Hyperbolic cotangent</div>
                </div>
              </div>

              {/* Inverse Hyperbolic */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🔄</span> Inverse Hyperbolic
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">asinh(x)</span> - Inverse sinh</div>
                  <div><span className="text-purple-400">acosh(x)</span> - Inverse cosh</div>
                  <div><span className="text-purple-400">atanh(x)</span> - Inverse tanh</div>
                  <div><span className="text-purple-400">asech(x)</span> - Inverse sech</div>
                  <div><span className="text-purple-400">acsch(x)</span> - Inverse csch</div>
                  <div><span className="text-purple-400">acoth(x)</span> - Inverse coth</div>
                </div>
              </div>

              {/* Exponential & Logarithmic */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>📈</span> Exponential & Log
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">exp(x)</span> - e^x</div>
                  <div><span className="text-purple-400">log(x)</span> - Natural log (ln)</div>
                  <div><span className="text-purple-400">ln(x)</span> - Natural log</div>
                  <div><span className="text-purple-400">log10(x)</span> - Base-10 log</div>
                  <div><span className="text-purple-400">log2(x)</span> - Base-2 log</div>
                  <div><span className="text-purple-400">pow(x,y)</span> - x to power y</div>
                </div>
              </div>

              {/* Roots & Powers */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>√</span> Roots
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">sqrt(x)</span> - Square root</div>
                  <div><span className="text-purple-400">cbrt(x)</span> - Cube root</div>
                  <div><span className="text-purple-400">nthRoot(x,n)</span> - Nth root</div>
                  <div><span className="text-purple-400">x^2</span> - Square</div>
                  <div><span className="text-purple-400">x^(1/3)</span> - Cube root</div>
                </div>
              </div>

              {/* Rounding & Absolute */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🔢</span> Rounding
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">abs(x)</span> or <span className="text-purple-400">|x|</span> - Absolute value</div>
                  <div><span className="text-purple-400">ceil(x)</span> - Round up</div>
                  <div><span className="text-purple-400">floor(x)</span> - Round down</div>
                  <div><span className="text-purple-400">round(x)</span> - Round nearest</div>
                  <div><span className="text-purple-400">fix(x)</span> - Round toward zero</div>
                  <div><span className="text-purple-400">trunc(x)</span> - Truncate decimals</div>
                </div>
              </div>

              {/* Comparison */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>⚖️</span> Comparison
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">min(a,b,...)</span> - Minimum</div>
                  <div><span className="text-purple-400">max(a,b,...)</span> - Maximum</div>
                  <div><span className="text-purple-400">sign(x)</span> - Sign (-1, 0, 1)</div>
                </div>
              </div>

              {/* Number Theory */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🔬</span> Number Theory
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">factorial(n)</span> - n!</div>
                  <div><span className="text-purple-400">gamma(x)</span> - Gamma function</div>
                  <div><span className="text-purple-400">mod(x,y)</span> - Modulo</div>
                  <div><span className="text-purple-400">gcd(a,b)</span> - Greatest common divisor</div>
                  <div><span className="text-purple-400">lcm(a,b)</span> - Least common multiple</div>
                </div>
              </div>

              {/* Constants */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🎯</span> Constants
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">pi</span> or <span className="text-purple-400">PI</span> - π ≈ 3.14159</div>
                  <div><span className="text-purple-400">e</span> or <span className="text-purple-400">E</span> - Euler's number ≈ 2.71828</div>
                  <div><span className="text-purple-400">i</span> - Imaginary unit √-1</div>
                  <div><span className="text-purple-400">Infinity</span> - ∞</div>
                </div>
              </div>

              {/* Combinatorics */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>🎲</span> Combinatorics
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">combinations(n,k)</span> - nCk</div>
                  <div><span className="text-purple-400">permutations(n,k)</span> - nPk</div>
                  <div><span className="text-purple-400">random()</span> - Random [0,1)</div>
                </div>
              </div>

              {/* Preset Shapes */}
              <div className="p-5 bg-neutral-800/30 rounded-xl border border-neutral-700/50">
                <h4 className="font-semibold text-pink-400 mb-3 flex items-center gap-2">
                  <span>⭕</span> Preset Shapes
                </h4>
                <div className="text-sm text-neutral-300 font-mono space-y-1">
                  <div><span className="text-purple-400">circle(r)</span> - Circle radius r</div>
                  <div><span className="text-purple-400">ellipse(a,b)</span> - Ellipse semi-axes a,b</div>
                  <div><span className="text-purple-400">hyperbola(a,b)</span> - Hyperbola</div>
                  <div><span className="text-purple-400">heart</span> - Heart curve</div>
                </div>
              </div>
            </div>

            {/* Tips & Tricks */}
            <div className="mt-8 p-6 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 rounded-xl">
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <span>💡</span> Tips & Tricks
              </h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>• <strong className="text-pink-400">Press Enter</strong> to plot - prevents lag while typing complex expressions</li>
                <li>• <strong className="text-pink-400">Parameters</strong> - Use single letters (a,b,c) in equations for automatic slider controls</li>
                <li>• <strong className="text-pink-400">Absolute value</strong> - Use either <code className="text-purple-400">|x|</code> or <code className="text-purple-400">abs(x)</code> notation</li>
                <li>• <strong className="text-pink-400">Multiple functions</strong> - Type in one input, and another appears automatically below</li>
                <li>• <strong className="text-pink-400">Collapsible sliders</strong> - Click "Sliders" header to show/hide parameter controls</li>
                <li>• <strong className="text-pink-400">Zoom & Pan</strong> - Mouse wheel to zoom, drag canvas to pan around</li>
                <li>• <strong className="text-pink-400">Grid toggle</strong> - Checkbox to show/hide coordinate grid</li>
                <li>• <strong className="text-pink-400">Point dragging</strong> - Click and drag points to move them interactively</li>
              </ul>
            </div>

            {/* Examples */}
            <div className="mt-8 p-6 bg-neutral-800/50 rounded-xl border border-neutral-700">
              <h3 className="text-xl font-semibold text-neutral-100 mb-4 flex items-center gap-2">
                <span>📝</span> Example Expressions
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-pink-400 font-semibold mb-2">Basic Plots</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">sin(x)</span></li>
                    <li>• <span className="text-purple-400">x^3 - 2*x</span></li>
                    <li>• <span className="text-purple-400">sqrt(x)</span></li>
                    <li>• <span className="text-purple-400">|sin(x)|</span></li>
                    <li>• <span className="text-purple-400">max(sin(x), cos(x))</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-pink-400 font-semibold mb-2">Parametric</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">a*sin(b*x + c)</span></li>
                    <li>• <span className="text-purple-400">a*x^2 + b*x + c</span></li>
                    <li>• <span className="text-purple-400">a*exp(-b*x)*cos(x)</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-pink-400 font-semibold mb-2">Implicit Curves</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">x^2 + y^2 = 16</span></li>
                    <li>• <span className="text-purple-400">(x/3)^2 + (y/2)^2 = 1</span></li>
                    <li>• <span className="text-purple-400">x^3 + y^3 = 3*x*y</span></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-pink-400 font-semibold mb-2">Inequalities</h4>
                  <ul className="space-y-1 text-sm text-neutral-300 font-mono">
                    <li>• <span className="text-purple-400">y &lt;= sin(x)</span></li>
                    <li>• <span className="text-purple-400">x^2 + y^2 &lt; 25</span></li>
                    <li>• <span className="text-purple-400">|x| + |y| &gt;= 3</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
