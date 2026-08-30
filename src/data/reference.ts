export type ReferenceCategory = 'mechanics' | 'electrostatics' | 'circuits' | 'magnetism' | 'waves' | 'thermal'

export const referenceCategories: Array<{ id: ReferenceCategory; label: string }> = [
  { id: 'mechanics', label: 'Mecânica e medidas' },
  { id: 'electrostatics', label: 'Eletrostática' },
  { id: 'circuits', label: 'Circuitos e RC' },
  { id: 'magnetism', label: 'Magnetismo e indução' },
  { id: 'waves', label: 'Ondas e ótica' },
  { id: 'thermal', label: 'Térmica' },
]

export interface UnitQuantity {
  id: string
  category: ReferenceCategory
  name: string
  symbol: string
  si: string
  equivalent: string
  common: string
  warning: string
}

export const unitQuantities: UnitQuantity[] = [
  { id: 'length', category: 'mechanics', name: 'Comprimento / distância / raio', symbol: 'x,d,r,R,l', si: '\\mathrm{m}', equivalent: 'metro', common: 'cm, mm, μm, nm', warning: 'Converte antes de elevar ao quadrado: 1 cm² = 10⁻⁴ m².' },
  { id: 'area', category: 'mechanics', name: 'Área', symbol: 'A', si: '\\mathrm{m^2}', equivalent: 'metro quadrado', common: 'cm², mm²', warning: 'O fator de conversão também fica ao quadrado.' },
  { id: 'volume', category: 'mechanics', name: 'Volume', symbol: 'V', si: '\\mathrm{m^3}', equivalent: 'metro cúbico', common: 'L, cm³', warning: '1 L = 10⁻³ m³ e 1 cm³ = 10⁻⁶ m³.' },
  { id: 'time', category: 'mechanics', name: 'Tempo', symbol: 't,\\Delta t,T', si: '\\mathrm{s}', equivalent: 'segundo', common: 'ms, min, h', warning: '1 min = 60 s; 1 h = 3600 s.' },
  { id: 'mass', category: 'mechanics', name: 'Massa', symbol: 'm', si: '\\mathrm{kg}', equivalent: 'quilograma', common: 'g, mg', warning: '1 g = 10⁻³ kg; o expoente do enunciado acompanha a conversão.' },
  { id: 'speed', category: 'mechanics', name: 'Velocidade', symbol: 'v,c', si: '\\mathrm{m\\,s^{-1}}', equivalent: 'm/s', common: 'km/h', warning: 'Divide km/h por 3,6 para obter m/s.' },
  { id: 'acceleration', category: 'mechanics', name: 'Aceleração', symbol: 'a,g', si: '\\mathrm{m\\,s^{-2}}', equivalent: 'm/s²', common: '—', warning: 'Em queda próxima da Terra usa g = 9,81 m/s².' },
  { id: 'force', category: 'mechanics', name: 'Força', symbol: 'F', si: '\\mathrm{N}', equivalent: '\\mathrm{kg\\,m\\,s^{-2}}', common: 'mN, μN', warning: 'Uma força vetorial exige módulo, direção e sentido.' },
  { id: 'energy', category: 'mechanics', name: 'Energia / trabalho / calor', symbol: 'E,W,Q', si: '\\mathrm{J}', equivalent: '\\mathrm{N\\,m=kg\\,m^2\\,s^{-2}}', common: 'kJ, eV', warning: 'Não confundas energia J com potência W.' },
  { id: 'power', category: 'mechanics', name: 'Potência', symbol: 'P,\\dot Q', si: '\\mathrm{W}', equivalent: '\\mathrm{J\\,s^{-1}}', common: 'mW, kW', warning: 'Em térmica, fluxo de calor total tem unidade W.' },

  { id: 'charge', category: 'electrostatics', name: 'Carga elétrica', symbol: 'q,Q', si: '\\mathrm{C}', equivalent: '\\mathrm{A\\,s}', common: 'μC, nC, pC', warning: 'μC = 10⁻⁶ C; conserva o sinal da carga.' },
  { id: 'electric-field', category: 'electrostatics', name: 'Campo elétrico', symbol: 'E', si: '\\mathrm{N\\,C^{-1}}', equivalent: '\\mathrm{V\\,m^{-1}}', common: 'kV/m', warning: 'N/C e V/m são exatamente equivalentes.' },
  { id: 'potential', category: 'electrostatics', name: 'Potencial / diferença de potencial', symbol: 'V,\\Delta V', si: '\\mathrm{V}', equivalent: '\\mathrm{J\\,C^{-1}}', common: 'mV, kV', warning: 'Potencial é escalar; campo elétrico é vetorial.' },
  { id: 'surface-charge', category: 'electrostatics', name: 'Densidade superficial de carga', symbol: '\\sigma', si: '\\mathrm{C\\,m^{-2}}', equivalent: 'carga por área', common: 'μC/m²', warning: 'A área tem de estar em m².' },
  { id: 'permittivity', category: 'electrostatics', name: 'Permissividade elétrica', symbol: '\\varepsilon,\\varepsilon_0', si: '\\mathrm{F\\,m^{-1}}', equivalent: '\\mathrm{C^2\\,N^{-1}\\,m^{-2}}', common: '—', warning: 'A permissividade relativa εᵣ não tem unidade.' },

  { id: 'current', category: 'circuits', name: 'Corrente elétrica', symbol: 'I,i', si: '\\mathrm{A}', equivalent: '\\mathrm{C\\,s^{-1}}', common: 'mA, μA', warning: 'mA = 10⁻³ A; identifica o sentido assumido.' },
  { id: 'resistance', category: 'circuits', name: 'Resistência elétrica', symbol: 'R', si: '\\Omega', equivalent: '\\mathrm{V\\,A^{-1}}', common: 'kΩ, MΩ', warning: 'kΩ = 10³ Ω; MΩ = 10⁶ Ω.' },
  { id: 'resistivity', category: 'circuits', name: 'Resistividade', symbol: '\\rho', si: '\\Omega\\,\\mathrm{m}', equivalent: 'ohm metro', common: 'Ω·mm²/m', warning: 'Não confundas resistividade ρ com resistência R.' },
  { id: 'capacitance', category: 'circuits', name: 'Capacidade', symbol: 'C', si: '\\mathrm{F}', equivalent: '\\mathrm{C\\,V^{-1}}', common: 'μF, nF, pF', warning: 'μF = 10⁻⁶ F; nF = 10⁻⁹ F.' },
  { id: 'time-constant', category: 'circuits', name: 'Constante de tempo RC', symbol: '\\tau', si: '\\mathrm{s}', equivalent: '\\Omega\\,\\mathrm{F}', common: 'ms, μs', warning: 'O produto RC reduz dimensionalmente a segundos.' },
  { id: 'efficiency', category: 'circuits', name: 'Rendimento', symbol: '\\eta', si: '1', equivalent: 'adimensional', common: '%', warning: 'Se estiver em percentagem, divide por 100 antes de calcular.' },

  { id: 'magnetic-field', category: 'magnetism', name: 'Campo magnético', symbol: 'B', si: '\\mathrm{T}', equivalent: '\\mathrm{N\\,A^{-1}\\,m^{-1}}', common: 'mT, μT', warning: 'mT = 10⁻³ T; μT = 10⁻⁶ T.' },
  { id: 'magnetic-flux', category: 'magnetism', name: 'Fluxo magnético', symbol: '\\Phi_B', si: '\\mathrm{Wb}', equivalent: '\\mathrm{T\\,m^2=V\\,s}', common: 'mWb', warning: 'O ângulo é entre B e a normal à área.' },
  { id: 'emf', category: 'magnetism', name: 'Força eletromotriz', symbol: '\\mathcal{E}', si: '\\mathrm{V}', equivalent: '\\mathrm{J\\,C^{-1}}', common: 'mV', warning: 'Apesar do nome, FEM mede-se em volt, não em newton.' },
  { id: 'permeability', category: 'magnetism', name: 'Permeabilidade magnética', symbol: '\\mu_0', si: '\\mathrm{H\\,m^{-1}}', equivalent: '\\mathrm{N\\,A^{-2}}', common: '—', warning: 'No vazio: μ₀ = 4π×10⁻⁷ N/A².' },
  { id: 'turn-density', category: 'magnetism', name: 'Densidade de espiras', symbol: 'n=N/L', si: '\\mathrm{m^{-1}}', equivalent: 'espiras por metro', common: '—', warning: 'N é apenas uma contagem e não tem unidade.' },

  { id: 'frequency', category: 'waves', name: 'Frequência', symbol: 'f', si: '\\mathrm{Hz}', equivalent: '\\mathrm{s^{-1}}', common: 'kHz, MHz, GHz', warning: 'Não confundas f com frequência angular ω.' },
  { id: 'angular-frequency', category: 'waves', name: 'Frequência angular', symbol: '\\omega', si: '\\mathrm{rad\\,s^{-1}}', equivalent: '\\mathrm{s^{-1}}', common: '—', warning: 'ω = 2πf; radiano é dimensionalmente adimensional.' },
  { id: 'wavelength', category: 'waves', name: 'Comprimento de onda', symbol: '\\lambda', si: '\\mathrm{m}', equivalent: 'metro', common: 'nm, μm', warning: 'Em ótica, é frequente converter nm para m.' },
  { id: 'wave-number', category: 'waves', name: 'Número de onda', symbol: 'k', si: '\\mathrm{rad\\,m^{-1}}', equivalent: '\\mathrm{m^{-1}}', common: '—', warning: 'k = 2π/λ; não é a constante de Coulomb nem condutividade.' },
  { id: 'intensity', category: 'waves', name: 'Intensidade de onda / radiação', symbol: 'I', si: '\\mathrm{W\\,m^{-2}}', equivalent: 'potência por área', common: 'mW/m²', warning: 'Não confundas com corrente elétrica, também representada por I.' },
  { id: 'refractive-index', category: 'waves', name: 'Índice de refração', symbol: 'n', si: '1', equivalent: 'adimensional', common: '—', warning: 'n = c/v e é normalmente maior ou igual a 1.' },
  { id: 'angle', category: 'waves', name: 'Ângulo', symbol: '\\theta,\\phi', si: '\\mathrm{rad}', equivalent: 'radiano', common: 'graus (°)', warning: 'Nos exercícios de Snell e Malus, confirma se a calculadora está em graus.' },
  { id: 'numerical-aperture', category: 'waves', name: 'Abertura numérica', symbol: 'A.N.', si: '1', equivalent: 'adimensional', common: '—', warning: 'A.N. = sin φ e não pode exceder 1 no ar.' },

  { id: 'temperature', category: 'thermal', name: 'Temperatura absoluta', symbol: 'T', si: '\\mathrm{K}', equivalent: 'kelvin', common: '°C', warning: 'T(K) = T(°C) + 273,15.' },
  { id: 'temperature-difference', category: 'thermal', name: 'Diferença de temperatura', symbol: '\\Delta T', si: '\\mathrm{K}', equivalent: 'kelvin', common: '°C', warning: 'Uma diferença de 1 °C vale exatamente 1 K.' },
  { id: 'specific-heat', category: 'thermal', name: 'Calor específico', symbol: 'c', si: '\\mathrm{J\\,kg^{-1}\\,K^{-1}}', equivalent: 'energia por massa e temperatura', common: 'J/(g·°C)', warning: 'A unidade de c tem de ser compatível com a unidade da massa.' },
  { id: 'latent-heat', category: 'thermal', name: 'Calor latente específico', symbol: '\\lambda', si: '\\mathrm{J\\,kg^{-1}}', equivalent: 'energia por massa', common: 'kJ/kg', warning: 'Nesta fórmula λ não é comprimento de onda.' },
  { id: 'conductivity', category: 'thermal', name: 'Condutividade térmica', symbol: 'k', si: '\\mathrm{W\\,m^{-1}\\,K^{-1}}', equivalent: 'W/(m·K)', common: '—', warning: 'Nesta secção k não é constante de Coulomb nem número de onda.' },
  { id: 'convection', category: 'thermal', name: 'Coeficiente de convecção', symbol: 'h', si: '\\mathrm{W\\,m^{-2}\\,K^{-1}}', equivalent: 'W/(m²·K)', common: '—', warning: 'Multiplica por área e ΔT para obter W.' },
  { id: 'thermal-resistance', category: 'thermal', name: 'Resistência térmica', symbol: 'R_{th}', si: '\\mathrm{K\\,W^{-1}}', equivalent: 'kelvin por watt', common: '—', warning: 'Resistências em série somam-se quando o mesmo fluxo atravessa as camadas.' },
  { id: 'expansion', category: 'thermal', name: 'Coeficiente de dilatação', symbol: '\\alpha,\\beta', si: '\\mathrm{K^{-1}}', equivalent: 'por kelvin', common: '°C⁻¹', warning: 'K⁻¹ e °C⁻¹ são equivalentes para variações.' },
  { id: 'emissivity', category: 'thermal', name: 'Emissividade', symbol: '\\varepsilon', si: '1', equivalent: 'adimensional', common: '—', warning: 'Para uma superfície real, 0 ≤ ε ≤ 1.' },
]

export interface UnitConversion {
  id: string
  label: string
  from: string
  to: string
  convert: (value: number) => number
  rule: string
}

export const unitConversions: UnitConversion[] = [
  { id: 'cm-m', label: 'Centímetros → metros', from: 'cm', to: 'm', convert: (value) => value * 1e-2, rule: '× 10⁻²' },
  { id: 'cm2-m2', label: 'Centímetros quadrados → metros quadrados', from: 'cm²', to: 'm²', convert: (value) => value * 1e-4, rule: '× 10⁻⁴' },
  { id: 'g-kg', label: 'Gramas → quilogramas', from: 'g', to: 'kg', convert: (value) => value * 1e-3, rule: '× 10⁻³' },
  { id: 'kmh-ms', label: 'Quilómetros por hora → metros por segundo', from: 'km/h', to: 'm/s', convert: (value) => value / 3.6, rule: '÷ 3,6' },
  { id: 'microc-c', label: 'Microcoulomb → coulomb', from: 'μC', to: 'C', convert: (value) => value * 1e-6, rule: '× 10⁻⁶' },
  { id: 'microf-f', label: 'Microfarad → farad', from: 'μF', to: 'F', convert: (value) => value * 1e-6, rule: '× 10⁻⁶' },
  { id: 'mt-t', label: 'Militesla → tesla', from: 'mT', to: 'T', convert: (value) => value * 1e-3, rule: '× 10⁻³' },
  { id: 'nm-m', label: 'Nanómetros → metros', from: 'nm', to: 'm', convert: (value) => value * 1e-9, rule: '× 10⁻⁹' },
  { id: 'celsius-kelvin', label: 'Graus Celsius → kelvin', from: '°C', to: 'K', convert: (value) => value + 273.15, rule: '+ 273,15' },
  { id: 'minutes-seconds', label: 'Minutos → segundos', from: 'min', to: 's', convert: (value) => value * 60, rule: '× 60' },
]

export interface OfficialFormulaGroup {
  id: ReferenceCategory
  title: string
  formulas: string[]
}

export const officialFormulaGroups: OfficialFormulaGroup[] = [
  {
    id: 'electrostatics', title: 'Eletrostática, potencial e energia', formulas: [
      String.raw`|\vec F|=k\frac{|q_1q_2|}{r^2}`, String.raw`\vec F=q\vec E`, String.raw`|\vec E|=k\frac{|q|}{r^2}`,
      String.raw`|\vec E|=\frac{\Delta V}{d}`, String.raw`|\vec E|=\frac{\sigma}{2\varepsilon_0}`, String.raw`\sigma=\frac{q}{A}`,
      String.raw`V=k\frac{q}{r}`, String.raw`E_p=qV`, String.raw`W_{A\to B}=q(V_A-V_B)`, String.raw`\Delta E_c=-\Delta E_p`,
      String.raw`E_c=\frac12mv^2`, String.raw`W=\vec F\cdot\vec d`,
    ],
  },
  {
    id: 'circuits', title: 'Corrente, circuitos, condensadores e RC', formulas: [
      String.raw`i=\frac{dq}{dt}`, String.raw`I=\frac{\Delta Q}{\Delta t}`, String.raw`V=RI`, String.raw`R=\rho\frac{l}{A}`,
      String.raw`\rho-\rho_0=-\alpha(T-T_0)`, String.raw`R_{eq}=\sum_iR_i`, String.raw`\frac1{R_{eq}}=\sum_i\frac1{R_i}`,
      String.raw`\eta=\frac{E_{transformada}}{Q}`, String.raw`P=\frac{\Delta E}{\Delta t}`, String.raw`P=VI`, String.raw`\sum_iV_i=0`, String.raw`\sum_iI_i=0`,
      String.raw`V=\frac QC`, String.raw`C=\varepsilon\frac Ad`, String.raw`\varepsilon_r=\frac\varepsilon{\varepsilon_0}`, String.raw`E=\frac12QV`,
      String.raw`C_{eq}=\sum_iC_i`, String.raw`\frac1{C_{eq}}=\sum_i\frac1{C_i}`, String.raw`q(t)=q_{total}(1-e^{-t/\tau})`,
      String.raw`q(t)=q_{total}e^{-t/\tau}`, String.raw`\tau=R_{eq}C`, String.raw`i(t)=I_0e^{-t/\tau}`,
      String.raw`V(t)=V_{max}(1-e^{-t/\tau})`, String.raw`V(t)=V_{max}e^{-t/\tau}`,
    ],
  },
  {
    id: 'magnetism', title: 'Forças, magnetismo, indução e transformadores', formulas: [
      String.raw`\vec F_{em}=q\vec E+q\vec v\times\vec B`, String.raw`\vec F_m=q\vec v\times\vec B`, String.raw`d\vec F=I\,d\vec l\times\vec B`,
      String.raw`F_c=m\frac{v^2}{R}`, String.raw`f=\frac1T`, String.raw`v=\frac{\Delta x}{\Delta t}`, String.raw`\omega=\frac vR`, String.raw`\omega=2\pi f`, String.raw`\sum_i\vec F_i=m\vec a`,
      String.raw`\vec B=\frac{\mu_0}{4\pi}\frac{q\,\vec v\times\hat r}{r^2}`, String.raw`d\vec B=\frac{\mu_0}{4\pi}\frac{I\,d\vec l\times\hat r}{r^2}`,
      String.raw`B=\mu_0nI\;(\text{solenoide})`, String.raw`B=\frac{\mu_0}{4\pi}\frac{2I}{R}\;(\text{fio reto e longo})`, String.raw`B=\frac{\mu_0}{2}\frac IR\;(\text{centro da espira})`,
      String.raw`\Phi_m=\int\vec B\cdot d\vec A`, String.raw`\Phi_m=NBA\cos\theta`, String.raw`\mathcal E_{ind}=-\frac{d\Phi}{dt}`, String.raw`\mathcal E_{ind}=vBl`,
      String.raw`\frac{V_P}{V_S}=\frac{N_P}{N_S}`, String.raw`\frac{i_P}{i_S}=\frac{N_S}{N_P}`, String.raw`P_P=P_S`,
    ],
  },
  {
    id: 'waves', title: 'Ondas eletromagnéticas e ótica', formulas: [
      String.raw`\vec S=\frac1{\mu_0}\vec E\times\vec B`, String.raw`I=\frac P{\mathrm{area}}=\frac{\mathrm{Energia}}{\mathrm{tempo}\times\mathrm{area}}`,
      String.raw`I=|\vec S|_{\mathrm{medio}}=\frac1{2\mu_0}E_mB_m`, String.raw`E=E_m\sin(\omega t-kx)`, String.raw`B=B_m\sin(\omega t-kx)`,
      String.raw`c=\frac{E_m}{B_m}`, String.raw`c=\lambda f`, String.raw`\omega=2\pi f`, String.raw`k=\frac{2\pi}{\lambda}`,
      String.raw`I_t=I_i\cos^2\theta`, String.raw`n=\frac cv`, String.raw`n_{ar}=1`, String.raw`\theta_i=\theta_r`,
      String.raw`n_1\sin\theta_1=n_2\sin\theta_2`, String.raw`\theta_c=\sin^{-1}\!\left(\frac{n_t}{n_i}\right)`, String.raw`A.N.=\sin\phi=\sqrt{n_{\mathrm{nucleo}}^2-n_{\mathrm{bainha}}^2}`,
    ],
  },
  {
    id: 'thermal', title: 'Calor, transferência térmica e movimento', formulas: [
      String.raw`Q=cm\Delta T`, String.raw`Q=m\lambda`, String.raw`\Delta l=l\alpha\Delta T`, String.raw`\Delta V=V\beta\Delta T`, String.raw`\lambda_{max}T=2{,}898\times10^{-3}`,
      String.raw`\dot Q=\frac{\Delta Q}{\Delta t}`, String.raw`\dot Q=kA\frac{\Delta T}{\Delta x}`, String.raw`\dot Q=hA\Delta T`,
      String.raw`P=\varepsilon\sigma AT^4`, String.raw`\dot Q=\varepsilon\sigma A(T_f^4-T_{viz}^4)`, String.raw`\dot Q=kA\frac{\partial T}{\partial x}`,
      String.raw`\dot Q=\frac{\partial}{\partial x}\!\left(k\frac{\partial T}{\partial x}\right)+\frac{\partial}{\partial y}\!\left(k\frac{\partial T}{\partial y}\right)+\frac{\partial}{\partial z}\!\left(k\frac{\partial T}{\partial z}\right)`,
      String.raw`R=\frac{\Delta x}{kA}`, String.raw`R=\frac1{hA}`, String.raw`\Delta E_{int}=Q+W`, String.raw`\vec r=\vec r_0+\vec v_0t+\frac12\vec a\,t^2`,
    ],
  },
]

export const officialConstants: Array<{ formula: string; label: string; note?: string }> = [
  { formula: String.raw`\sigma=5{,}6697\times10^{-8}\;\mathrm{W\,m^{-2}\,K^{-4}}`, label: 'Stefan-Boltzmann' },
  { formula: String.raw`k_B=1{,}380649\times10^{-23}\;\mathrm{J\,K^{-1}}`, label: 'Boltzmann', note: 'O PDF 2025/2026 aparenta omitir o algarismo 2 no expoente e imprime 10⁻³.' },
  { formula: String.raw`N_A=6{,}022\times10^{23}\;\mathrm{mol^{-1}}`, label: 'Número de Avogadro' },
  { formula: String.raw`R=8{,}32\;\mathrm{J\,mol^{-1}\,K^{-1}}`, label: 'Constante dos gases perfeitos' },
  { formula: String.raw`q_e=1{,}60217653\times10^{-19}\;\mathrm C`, label: 'Carga elementar' },
  { formula: String.raw`m_e=9{,}109\times10^{-31}\;\mathrm{kg}`, label: 'Massa do eletrão' },
  { formula: String.raw`m_p=1{,}673\times10^{-27}\;\mathrm{kg}`, label: 'Massa do protão' },
  { formula: String.raw`k=8{,}99\times10^9\;\mathrm{N\,m^2\,C^{-2}}`, label: 'Constante de Coulomb' },
  { formula: String.raw`\varepsilon_0=8{,}85\times10^{-12}\;\mathrm{C^2\,N^{-1}\,m^{-2}}`, label: 'Permissividade elétrica do vazio' },
  { formula: String.raw`\mu_0=4\pi\times10^{-7}\;\mathrm{N\,A^{-2}}`, label: 'Permeabilidade magnética do vazio' },
  { formula: String.raw`c=3{,}0\times10^8\;\mathrm{m\,s^{-1}}`, label: 'Velocidade da luz no vazio' },
  { formula: String.raw`G=6{,}67\times10^{-11}\;\mathrm{N\,m^2\,kg^{-2}}`, label: 'Gravitação universal' },
  { formula: String.raw`g=9{,}81\;\mathrm{m\,s^{-2}}`, label: 'Aceleração da gravidade' },
]
