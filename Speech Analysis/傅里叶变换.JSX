import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Play, Pause, Plus, Trash2, Activity, Waves, Info, Zap, Grid, Layers, Clock } from 'lucide-react';

// --- 数学核心库 ---

const PI = Math.PI;
const TWO_PI = 2 * PI;

// 1. 基础信号生成
const getSineValue = (t, freq, amp, phase) => amp * Math.cos(TWO_PI * freq * t + phase);

// 2. 复数运算类 (用于 FFT)
class Complex {
  constructor(re = 0, im = 0) {
    this.re = re;
    this.im = im;
  }
  add(c) { return new Complex(this.re + c.re, this.im + c.im); }
  sub(c) { return new Complex(this.re - c.re, this.im - c.im); }
  mul(c) { return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re); }
  magnitude() { return Math.sqrt(this.re * this.re + this.im * this.im); }
}

// 3. Cooley-Tukey FFT 算法实现 (递归版，用于教学展示)
const fft = (x) => {
  const N = x.length;
  
  // 基准情况
  if (N <= 1) return x;

  // 错误保护：确保 N 是偶数才能进行分割。
  // 如果输入不是 2 的幂，Cooley-Tukey 算法会失败。
  // 这里做一个简单的检查，如果到了奇数（且 > 1），说明初始长度不是 2 的幂。
  if (N % 2 !== 0) {
      // 在教学演示中，最好的办法是直接返回原值或零，避免页面崩溃。
      // 实际上，我们在调用前会确保输入是 2 的幂。
      return x; 
  }

  const even = fft(x.filter((_, i) => i % 2 === 0));
  const odd = fft(x.filter((_, i) => i % 2 !== 0));

  const t = new Array(N / 2).fill(0).map((_, k) => {
    const angle = -2 * Math.PI * k / N;
    return new Complex(Math.cos(angle), Math.sin(angle));
  });

  const output = new Array(N);
  for (let k = 0; k < N / 2; k++) {
    const oddPart = t[k].mul(odd[k]);
    output[k] = even[k].add(oddPart);
    output[k + N / 2] = even[k].sub(oddPart);
  }
  return output;
};

// 辅助：填充数组到最近的 2 的幂
const padToPowerOfTwo = (input) => {
    const n = input.length;
    if ((n & (n - 1)) === 0) return input; // 已经是 2 的幂
    const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
    const padded = [...input];
    for (let i = n; i < nextPow2; i++) {
        padded.push(new Complex(0, 0));
    }
    return padded;
};

// --- 组件部分 ---

const FourierMasterLab = () => {
  const [activeTab, setActiveTab] = useState('concept'); // concept, fft, stft
  
  // --- 共享状态：基础信号成分 ---
  const [components, setComponents] = useState([
    { id: 1, freq: 2, amp: 1, phase: 0, color: '#60A5FA' },
    { id: 2, freq: 5, amp: 0.5, phase: 0, color: '#34D399' },
  ]);

  // --- STFT 专用状态 ---
  // 动态信号类型：static (使用上面的 components), chirp (线性调频), jump (频率跳变)
  const [signalType, setSignalType] = useState('chirp'); 
  
  // 修复：使用索引来控制窗口大小，确保始终是 2 的幂
  const windowOptions = [32, 64, 128, 256];
  const [windowSizeIndex, setWindowSizeIndex] = useState(1); // 默认 64 (index 1)
  const windowSize = windowOptions[windowSizeIndex];
  
  // --- Concept 专用状态 ---
  const [windingFreq, setWindingFreq] = useState(0);
  const [isWindingPlaying, setIsWindingPlaying] = useState(false);
  const windingRef = useRef(null);

  // --- 辅助函数 ---
  
  const handleAddComponent = () => {
    const newId = components.length > 0 ? Math.max(...components.map(c => c.id)) + 1 : 1;
    setComponents([...components, { 
      id: newId, 
      freq: Math.floor(Math.random() * 8) + 1, 
      amp: 0.5, 
      phase: 0,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`
    }]);
  };

  const updateComponent = (id, field, value) => {
    setComponents(components.map(c => c.id === id ? { ...c, [field]: parseFloat(value) } : c));
  };

  const removeComponent = (id) => setComponents(components.filter(c => c.id !== id));

  // --- 信号生成器 ---

  // 获取特定时刻的信号值
  const getSignalAtTime = useCallback((t, totalDuration) => {
    if (signalType === 'static') {
      return components.reduce((acc, curr) => acc + getSineValue(t, curr.freq, curr.amp, curr.phase), 0);
    } else if (signalType === 'chirp') {
      // 线性调频: 频率从 1Hz 变到 15Hz
      const startFreq = 1;
      const endFreq = 15;
      // cos(2 * pi * f(t) * t) 的积分形式用于 chirp
      return Math.cos(TWO_PI * (startFreq * t + (endFreq - startFreq)/(2*totalDuration) * t * t));
    } else if (signalType === 'jump') {
      // 频率跳变: 0-1s: 5Hz, 1-2s: 15Hz
      const freq = t < totalDuration / 2 ? 5 : 15;
      return Math.cos(TWO_PI * freq * t);
    }
    return 0;
  }, [components, signalType]);

  // --- 视图 1: 概念原理 (Winding Machine) ---
  
  // Concept 动画循环
  useEffect(() => {
    if (activeTab === 'concept' && isWindingPlaying) {
      const animate = () => {
        setWindingFreq(prev => (prev + 0.01) > 10 ? 0 : prev + 0.01);
        windingRef.current = requestAnimationFrame(animate);
      };
      windingRef.current = requestAnimationFrame(animate);
    } else {
      cancelAnimationFrame(windingRef.current);
    }
    return () => cancelAnimationFrame(windingRef.current);
  }, [isWindingPlaying, activeTab]);

  const ConceptView = useMemo(() => {
    const sampleRate = 200;
    const duration = 2;
    const timeData = [];
    let sumX = 0, sumY = 0;
    const windingPoints = [];

    for (let i = 0; i <= sampleRate; i++) {
      const t = (i / sampleRate) * duration;
      const y = getSignalAtTime(t, duration); // 使用统一信号源
      timeData.push({ t, y });

      const angle = -TWO_PI * windingFreq * t;
      const r = y * 0.8 + 2.5;
      const wx = r * Math.cos(angle);
      const wy = r * Math.sin(angle);
      
      sumX += wx;
      sumY += wy;
      windingPoints.push({ x: wx, y: wy });
    }

    const centerX = sumX / timeData.length;
    const centerY = sumY / timeData.length;
    const magnitude = Math.sqrt(centerX * centerX + centerY * centerY);

    const createPath = (data) => {
       if (data.length === 0) return '';
       return `M ${data.map((d, i) => `${((i / data.length) * 800).toFixed(1)},${(100 - d.y * 30).toFixed(1)}`).join(' L ')}`;
    };

    const createWindingPath = (points) => {
        return `M ${points.map(p => `${(p.x * 25).toFixed(1)},${(p.y * 25).toFixed(1)}`).join(' L ')}`;
    };

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-500">
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-slate-400 font-medium">1. 时域信号与缠绕机</h3>
                <button 
                  onClick={() => setIsWindingPlaying(!isWindingPlaying)}
                  className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${isWindingPlaying ? 'bg-red-500/20 text-red-400' : 'bg-blue-600 text-white'}`}
                >
                  {isWindingPlaying ? <Pause size={14} /> : <Play size={14} />}
                  {isWindingPlaying ? '停止' : '自动扫描'}
                </button>
            </div>
            
            <div className="mb-4 bg-slate-900/50 rounded h-32 relative overflow-hidden border border-slate-700/50">
                <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
                    <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" />
                    <path d={createPath(timeData)} fill="none" stroke="#F472B6" strokeWidth="2" />
                </svg>
            </div>

            <div className="flex flex-col items-center justify-center relative aspect-square bg-slate-900/50 rounded border border-slate-700/50 overflow-hidden">
                <svg className="w-full h-full" viewBox="-150 -150 300 300">
                    <line x1="-150" y1="0" x2="150" y2="0" stroke="#334155" />
                    <line x1="0" y1="-150" x2="0" y2="150" stroke="#334155" />
                    <circle cx="0" cy="0" r="140" stroke="#334155" strokeDasharray="4 4" fill="none" opacity="0.5"/>
                    <path d={createWindingPath(windingPoints)} fill="none" stroke="#60A5FA" strokeWidth="1.5" opacity="0.6" />
                    <line x1="0" y1="0" x2={centerX * 25} y2={centerY * 25} stroke="#FACC15" strokeWidth="2" />
                    <circle cx={centerX * 25} cy={centerY * 25} r="4" fill="#FACC15" />
                </svg>
                <div className="absolute top-4 left-4 text-xs font-mono bg-black/50 p-2 rounded text-yellow-400 border border-yellow-500/30">
                    缠绕频率: {windingFreq.toFixed(2)} Hz<br/>
                    质心偏移: {magnitude.toFixed(3)}
                </div>
            </div>
            <div className="mt-4">
                 <input 
                    type="range" min="0" max="10" step="0.01" 
                    value={windingFreq}
                    onChange={(e) => { setIsWindingPlaying(false); setWindingFreq(parseFloat(e.target.value)); }}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                />
            </div>
        </div>
        
        <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 flex flex-col justify-center">
            <h3 className="text-xl font-bold text-white mb-4">原理说明</h3>
            <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                    <strong className="text-blue-400">傅里叶变换的核心思想：</strong>
                    为了检测信号中是否含有频率 <span className="font-mono text-yellow-400">f</span>，我们将信号以频率 <span className="font-mono text-yellow-400">f</span> 缠绕在圆上。
                </p>
                <p>
                    如果信号中真的包含这个频率，缠绕后的图形会在某个方向上“堆积”，导致整个图形的<strong className="text-yellow-400">质心（黄色圆点）</strong>偏离原点。
                </p>
                <p>
                    如果信号中不包含这个频率，图形会均匀分布在圆周上，质心接近原点 (0,0)。
                </p>
                <div className="bg-blue-900/20 border border-blue-800 p-3 rounded">
                    这就是数学公式 <span className="font-mono text-xs">∫ f(t) * e^(-2πift) dt</span> 的几何意义。
                </div>
            </div>
        </div>
      </div>
    );
  }, [components, windingFreq, isWindingPlaying, signalType, getSignalAtTime]);

  // --- 视图 2: FFT (频谱分析) ---

  const FFTView = useMemo(() => {
    // 准备数据
    const N = 256; // 采样点数，必须是 2 的幂
    const duration = 2; 
    const inputSignal = [];
    
    // 生成复数数组用于 FFT
    for(let i=0; i<N; i++) {
        const t = (i/N) * duration;
        inputSignal.push(new Complex(getSignalAtTime(t, duration), 0));
    }

    // 执行 FFT (确保输入是 2 的幂)
    const fftResult = fft(padToPowerOfTwo(inputSignal));
    
    // 计算幅值 (只取前一半 N/2，因为实数 FFT 结果是对称的)
    const magnitudes = fftResult.slice(0, N/2).map(c => c.magnitude());
    // 归一化用于显示
    const maxMag = Math.max(...magnitudes, 0.001); 

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-400" size={18}/> 
                    快速傅里叶变换 (FFT) 结果
                </h3>
                
                <div className="relative h-64 bg-slate-900/50 rounded-lg border border-slate-700/50 flex items-end px-2 pt-8 pb-0 gap-[2px]">
                    {magnitudes.map((mag, i) => {
                        const heightPct = (mag / maxMag) * 90;
                        const freq = i / duration; // 对应的实际频率
                        // 只显示低频部分 (0-20Hz) 以便观察，因为采样率相对较高
                        if (freq > 20) return null; 

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div 
                                    className="w-full bg-gradient-to-t from-indigo-600 to-blue-400 rounded-t hover:from-indigo-400 hover:to-blue-300 transition-all"
                                    style={{ height: `${heightPct}%` }}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-800 text-xs px-2 py-1 rounded border border-slate-600 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                    {freq.toFixed(1)} Hz
                                </div>
                            </div>
                        );
                    })}
                    <div className="absolute bottom-2 right-4 text-xs text-slate-500">频率 (Hz) →</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                     <h4 className="text-white font-medium mb-2">什么是 FFT?</h4>
                     <p className="text-sm text-slate-400">
                         FFT (Fast Fourier Transform) 是一种极高效率的算法，用于计算离散傅里叶变换 (DFT)。
                         <br/><br/>
                         它将计算复杂度从 <span className="font-mono text-red-400">O(N²)</span> 降低到了 <span className="font-mono text-green-400">O(N log N)</span>。
                         对于上面的 256 个点，普通算法需要 ~65,000 次运算，而 FFT 只需要 ~2,000 次。
                     </p>
                 </div>
                 <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700">
                     <h4 className="text-white font-medium mb-2">尝试操作</h4>
                     <p className="text-sm text-slate-400">
                         回到左侧控制面板，添加一个 <strong>8Hz</strong> 的信号。你会立即看到上图在 8Hz 处升起一根柱子。FFT 将复杂的波形瞬间拆解成了频率成分。
                     </p>
                 </div>
            </div>
        </div>
    );
  }, [getSignalAtTime]);

  // --- 视图 3: STFT (短时傅里叶变换 - 时频图) ---

  const STFTView = useMemo(() => {
      // 1. 生成长信号
      const duration = 2; // 秒
      const sampleRate = 128; // 降低采样率以简化计算
      const totalPoints = duration * sampleRate;
      const signalData = [];
      for (let i = 0; i < totalPoints; i++) {
          signalData.push(getSignalAtTime((i/sampleRate)*duration, duration));
      }

      // 2. STFT 计算
      const hopSize = Math.floor(windowSize / 4); // 75% overlap
      const spectrogram = [];
      
      // 汉宁窗 (Hann Window)
      const hann = (n, N) => 0.5 * (1 - Math.cos((2 * PI * n) / (N - 1)));

      for (let start = 0; start <= totalPoints - windowSize; start += hopSize) {
          // 截取窗口
          const segment = [];
          for (let i = 0; i < windowSize; i++) {
              const val = signalData[start + i] * hann(i, windowSize);
              segment.push(new Complex(val, 0));
          }
          
          // 对该窗口做 FFT (segment 长度必须是 2 的幂，由 windowSize 保证)
          const res = fft(segment);
          const mags = res.slice(0, windowSize/2).map(c => c.magnitude());
          spectrogram.push(mags);
      }

      return (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
              
              {/* 控制栏 */}
              <div className="flex flex-wrap gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700 items-center">
                  <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">信号类型:</span>
                      <div className="flex bg-slate-900 rounded p-1">
                          {['static', 'chirp', 'jump'].map(t => (
                              <button 
                                key={t}
                                onClick={() => setSignalType(t)}
                                className={`px-3 py-1 text-xs rounded transition-colors ${signalType === t ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                              >
                                  {t === 'static' ? '静态混合' : t === 'chirp' ? '线性调频 (Chirp)' : '频率跳变'}
                              </button>
                          ))}
                      </div>
                  </div>

                  <div className="w-px h-8 bg-slate-700 mx-2"></div>

                  <div className="flex items-center gap-4 flex-1">
                      <div className="flex flex-col flex-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">窗口大小 (Window Size): <span className="text-white font-mono">{windowSize}</span></span>
                            <span className="text-indigo-400 font-medium">
                                {windowSize < 64 ? '时间分辨率高 (模糊频率)' : '频率分辨率高 (模糊时间)'}
                            </span>
                        </div>
                        <input 
                            type="range" min="0" max="3" step="1"
                            value={windowSizeIndex}
                            onChange={(e) => setWindowSizeIndex(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 px-1 mt-1 font-mono">
                            <span>32</span>
                            <span>64</span>
                            <span>128</span>
                            <span>256</span>
                        </div>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 时频图展示 */}
                <div className="lg:col-span-2 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                    <h3 className="text-slate-400 font-medium mb-4 flex items-center gap-2">
                        <Layers size={18} className="text-green-400"/>
                        时频图 (Spectrogram)
                    </h3>
                    
                    <div className="relative w-full h-64 bg-black rounded border border-slate-700 overflow-hidden flex">
                        {/* 我们使用 flex-row 来绘制时间切片，每个切片是一个列 */}
                        {spectrogram.map((timeSlice, tIndex) => (
                            <div key={tIndex} className="flex-1 flex flex-col-reverse h-full" style={{ gap: '1px' }}>
                                {timeSlice.map((mag, fIndex) => {
                                    // 热力图颜色映射：Mag -> Opacity/Color
                                    const intensity = Math.min(mag * 3, 1); 
                                    return (
                                        <div 
                                            key={fIndex} 
                                            className="w-full flex-1"
                                            style={{ 
                                                backgroundColor: `hsla(${240 - intensity * 180}, 80%, 60%, ${intensity})` 
                                                // 蓝色(低) -> 红色(高)
                                            }}
                                            title={`Time: ${tIndex}, FreqBin: ${fIndex}`}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                        
                        {/* 坐标轴标签 */}
                        <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-1 rounded">时间 →</div>
                        <div className="absolute top-2 left-2 text-xs text-white bg-black/50 px-1 rounded">↑ 频率</div>
                    </div>
                </div>

                {/* 教学说明 */}
                <div className="space-y-4">
                    <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Clock size={16} /> 测不准原理
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed mb-4">
                            STFT 实际上是把信号切成小段，每段做 FFT。
                            <br/><br/>
                            <strong>试着拖动“窗口大小”滑块：</strong>
                        </p>
                        <ul className="text-sm space-y-3">
                            <li className="bg-indigo-900/20 p-2 rounded border-l-2 border-indigo-500">
                                <span className="text-indigo-300 font-medium">小窗口 (32):</span> <br/>
                                <span className="text-slate-400">你能看清信号什么时候变化（时间准），但频率糊成一团（频率不准）。</span>
                            </li>
                            <li className="bg-purple-900/20 p-2 rounded border-l-2 border-purple-500">
                                <span className="text-purple-300 font-medium">大窗口 (256):</span> <br/>
                                <span className="text-slate-400">你能看清具体的频率条纹（频率准），但看不清变化发生的确切时刻（时间糊）。</span>
                            </li>
                        </ul>
                    </div>
                </div>

              </div>
          </div>
      );
  }, [getSignalAtTime, windowSize, windowSizeIndex, signalType]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 font-sans selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-4 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <Activity className="w-8 h-8 text-blue-400" />
              傅里叶全能实验室
            </h1>
            <p className="text-slate-500 mt-1 text-sm">从原理到应用：DFT, FFT 与 STFT 的可视化探索</p>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
             {[
                 { id: 'concept', label: '原理 (Concept)', icon: Waves },
                 { id: 'fft', label: '频谱 (FFT)', icon: Zap },
                 { id: 'stft', label: '时频 (STFT)', icon: Grid }
             ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        activeTab === tab.id 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                 >
                     <tab.icon size={16} />
                     <span className="hidden md:inline">{tab.label}</span>
                 </button>
             ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 左侧：通用信号控制面板 (仅在 Concept 和 FFT 模式下显示，STFT 有自己的控制) */}
          {activeTab !== 'stft' && (
            <div className="lg:col-span-3 space-y-4 animate-in slide-in-from-left duration-300">
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-sm font-semibold flex items-center gap-2 uppercase tracking-wider text-slate-400">
                    <Waves size={16} /> 信号成分构造
                  </h2>
                  <button onClick={handleAddComponent} className="p-1 hover:bg-slate-700 rounded text-blue-400 transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                  {components.map((comp) => (
                    <div key={comp.id} className="bg-slate-800 p-3 rounded-lg border border-slate-700/50 group hover:border-slate-600 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: comp.color }}></div>
                            <span className="font-mono text-xs text-slate-300">Wave {comp.id}</span>
                        </div>
                        <button onClick={() => removeComponent(comp.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>频率 (Freq)</span>
                            <span className="text-slate-300">{comp.freq.toFixed(1)} Hz</span>
                          </div>
                          <input 
                            type="range" min="0" max="20" step="0.5"
                            value={comp.freq}
                            onChange={(e) => updateComponent(comp.id, 'freq', e.target.value)}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>振幅 (Amp)</span>
                            <span className="text-slate-300">{comp.amp.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" min="0" max="2" step="0.1"
                            value={comp.amp}
                            onChange={(e) => updateComponent(comp.id, 'amp', e.target.value)}
                            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-green-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {components.length === 0 && (
                      <div className="text-center py-8 text-slate-600 text-sm border-2 border-dashed border-slate-800 rounded-lg">
                          无信号<br/>点击右上角 + 添加
                      </div>
                  )}
                </div>
              </div>

              <div className="bg-indigo-900/10 rounded-xl p-4 border border-indigo-900/30 text-xs text-indigo-300 leading-relaxed">
                <Info className="w-4 h-4 mb-2 inline-block mr-1" />
                在此处调整的信号会同时应用到“原理”和“频谱”视图中。试试把两个频率设得很近（比如 5Hz 和 6Hz），看看会发生什么？
              </div>
            </div>
          )}

          {/* 主显示区域 */}
          <div className={`${activeTab === 'stft' ? 'lg:col-span-12' : 'lg:col-span-9'} min-h-[500px]`}>
            {activeTab === 'concept' && ConceptView}
            {activeTab === 'fft' && FFTView}
            {activeTab === 'stft' && STFTView}
          </div>

        </div>
      </div>
    </div>
  );
};

export default FourierMasterLab;
