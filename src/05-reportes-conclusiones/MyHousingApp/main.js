// loadCodeMirror
        async function loadCodeMirror() {
            const { EditorView, basicSetup } =
                await import('https://esm.sh/codemirror');
            const { python } =
                await import('https://esm.sh/@codemirror/lang-python');
            const { oneDark } =
                await import('https://esm.sh/@codemirror/theme-one-dark@6.1.2');

            window.CMModules = { EditorView, basicSetup, python, oneDark };
            window.dispatchEvent(new Event('codemirror-ready'));
        }
        loadCodeMirror();

/* === Main app === */
        /* ---- Navegacion ---- */
        const tabs = document.querySelectorAll('.nav-tab');
        const sections = document.querySelectorAll('.section');

        // Bandera para saber si los editores ya se crearon
        let _editoresCreados = false;

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.section;

                tabs.forEach(t => t.classList.remove('active'));
                sections.forEach(s => s.classList.remove('active'));

                tab.classList.add('active');
                document.getElementById(target).classList.add('active');

                // Crear editores la primera vez que el usuario abre la Sección 3
                // (fallback por si _tryInitS3 no los creó antes)
                if (target === 's3' && !_editoresCreados && _s3CmReady) {
                    _editoresCreados = true;
                    initEditores();
                }
                // NUEVO: inicializar el Playground al abrir la Sección 4
                if (target === 's4') {
                    initSeccion4();
                }
                // Forzar remedición de CodeMirror: ahora que s3 es visible,
                // los editores deben recalcular dimensiones y renderizar el código.
                if (target === 's3' && window.AppState.editors) {
                    requestAnimationFrame(() => {
                        Object.values(window.AppState.editors).forEach(view => {
                            view.requestMeasure();
                        });
                    });
                }

                // Notificar al sistema Neural Terminal del cambio de sección
                window.dispatchEvent(new CustomEvent('section-changed', {
                    detail: { id: target }
                }));
            });
        });

        /* ---- PYODIDE SETUP ---- */
        const loaderEl = document.getElementById('pyodide-loader');
        const loaderBar = document.getElementById('loader-bar');
        const loaderStep = document.getElementById('loader-step');
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');

        // Estado global compartido entre secciones
        window.AppState = {
            pyodide: null,           // instancia de Pyodide
            pyodideReady: false,     // bandera de listo
            lastResults: null,       // { mse, r2 } del último run en Playground
        };

        function setLoaderStep(text, percent) {
            loaderStep.textContent = text;
            loaderBar.style.width = percent + '%';
        }

        function setStatus(state, text) {
            statusDot.className = 'status-dot ' + state;
            statusText.textContent = text;
        }

        async function initPyodide() {
            try {
                setLoaderStep('Descargando Pyodide...', 10);
                setStatus('loading', 'Iniciando Python...');

                // Cargar Pyodide
                const pyodide = await loadPyodide();
                setLoaderStep('Instalando numpy y pandas...', 40);

                // Instalar paquetes necesarios
                await pyodide.loadPackage(['numpy', 'pandas', 'matplotlib', 'scikit-learn']);
                setLoaderStep('Configurando entorno...', 80);

                // Cargar el CSV en el sistema de archivos virtual de Pyodide
                const csvData = getCSVData();
                pyodide.FS.writeFile('/Housing.csv', csvData);
                setLoaderStep('Listo.', 100);

                // Guardar en estado global
                window.AppState.pyodide = pyodide;
                window.AppState.pyodideReady = true;

                // Actualizar UI
                setStatus('ready', 'Python listo');
                setTimeout(() => {
                    loaderEl.classList.add('hidden');
                }, 400);

                // Disparar evento para que otras secciones sepan que está listo
                window.dispatchEvent(new Event('pyodide-ready'));

            } catch (err) {
                console.error('Error iniciando Pyodide:', err);
                setStatus('error', 'Error al cargar Python');
                loaderStep.textContent = 'Error: ' + err.message;
                loaderStep.style.color = 'var(--accent3)';
            }
        }

        /* ---- DATOS CSV EMBEBIDOS ---- */
        // El CSV está embebido para que la app funcione sin servidor
        function getCSVData() {
            return `rownames,price,lotsize,bedrooms,bathrms,stories,driveway,recroom,fullbase,gashw,airco,garagepl,prefarea
1,42000,5850,3,1,2,yes,no,yes,no,no,1,no
2,38500,4000,2,1,1,yes,no,no,no,no,0,no
3,49500,3060,3,1,1,yes,no,no,no,no,0,no
4,60500,6650,3,1,2,yes,yes,no,no,no,0,no
5,61000,6360,2,1,1,yes,no,no,no,no,0,no
6,66000,4160,3,1,1,yes,yes,yes,no,yes,0,no
7,66000,3880,3,2,2,yes,no,yes,no,no,2,no
8,69000,4160,3,1,3,yes,no,no,no,no,0,no
9,83800,4800,3,1,1,yes,yes,yes,no,no,0,no
10,88500,5500,3,2,4,yes,yes,no,no,yes,1,no
11,90000,7200,3,2,1,yes,no,yes,no,yes,3,no
12,30500,3000,2,1,1,no,no,no,no,no,0,no
13,27000,1700,3,1,2,yes,no,no,no,no,0,no
14,36000,2880,3,1,1,no,no,no,no,no,0,no
15,37000,3600,2,1,1,yes,no,no,no,no,0,no
16,37900,3185,2,1,1,yes,no,no,no,yes,0,no
17,40500,3300,3,1,2,no,no,no,no,no,1,no
18,40750,5200,4,1,3,yes,no,no,no,no,0,no
19,45000,3450,1,1,1,yes,no,no,no,no,0,no
20,45000,3986,2,2,1,no,yes,yes,no,no,1,no
21,48500,4785,3,1,2,yes,yes,yes,no,yes,1,no
22,65900,4510,4,2,2,yes,no,yes,no,no,0,no
23,37900,4000,3,1,2,yes,no,no,no,yes,0,no
24,38000,3934,2,1,1,yes,no,no,no,no,0,no
25,42000,4960,2,1,1,yes,no,no,no,no,0,no
26,42300,3000,2,1,2,yes,no,no,no,no,0,no
27,43500,3800,2,1,1,yes,no,no,no,no,0,no
28,44000,4960,2,1,1,yes,no,yes,no,yes,0,no
29,44500,3000,3,1,1,no,no,no,no,yes,0,no
30,44900,4500,3,1,2,yes,no,no,no,yes,0,no
31,45000,3500,2,1,1,no,no,yes,no,no,0,no
32,48000,3500,4,1,2,yes,no,no,no,yes,2,no
33,49000,4000,2,1,1,yes,no,no,no,no,0,no
34,51500,4500,2,1,1,yes,no,no,no,no,0,no
35,61000,6360,2,1,2,yes,no,no,no,no,0,no
36,61000,4500,2,1,1,yes,no,no,no,yes,2,no
37,61700,4032,2,1,1,yes,no,yes,no,no,0,no
38,67000,5170,3,1,4,yes,no,no,no,yes,0,no
39,82000,5400,4,2,2,yes,no,no,no,yes,2,no
40,54500,3150,2,2,1,no,no,yes,no,no,0,no
41,66500,3745,3,1,2,yes,no,yes,no,no,0,no
42,70000,4520,3,1,2,yes,no,yes,no,yes,0,no
43,82000,4640,4,1,2,yes,no,no,no,no,1,no
44,92000,8580,5,3,2,yes,no,no,no,no,2,no
45,38000,2000,2,1,2,yes,no,no,no,no,0,no
46,44000,2160,3,1,2,no,no,yes,no,no,0,no
47,41000,3040,2,1,1,no,no,no,no,no,0,no
48,43000,3090,3,1,2,no,no,no,no,no,0,no
49,48000,4960,4,1,3,no,no,no,no,no,0,no
50,54800,3350,3,1,2,yes,no,no,no,no,0,no
51,55000,5300,5,2,2,yes,no,no,no,no,0,no
52,57000,4100,4,1,1,no,no,yes,no,no,0,no
53,68000,9166,2,1,1,yes,no,yes,no,yes,2,no
54,95000,4040,3,1,2,yes,no,yes,yes,no,1,no
55,38000,3630,3,3,2,no,yes,no,no,no,0,no
56,25000,3620,2,1,1,yes,no,no,no,no,0,no
57,25245,2400,3,1,1,no,no,no,no,no,0,no
58,56000,7260,3,2,1,yes,yes,yes,no,no,3,no
59,35500,4400,3,1,2,yes,no,no,no,no,0,no
60,30000,2400,3,1,2,yes,no,no,no,no,0,no
61,48000,4120,2,1,2,yes,no,no,no,no,0,no
62,48000,4750,2,1,1,yes,no,no,no,no,0,no
63,52000,4280,2,1,1,yes,no,no,no,yes,2,no
64,54000,4820,3,1,2,yes,no,no,no,no,0,no
65,56000,5500,4,1,2,yes,yes,yes,no,no,0,no
66,60000,5500,3,1,2,yes,no,no,no,yes,0,no
67,60000,5040,3,1,2,yes,no,yes,no,yes,0,no
68,67000,6000,2,1,1,yes,no,yes,no,yes,1,no
69,47000,2500,2,1,1,no,no,no,no,yes,0,no
70,70000,4095,3,1,2,no,yes,yes,no,yes,0,no
71,45000,4095,2,1,1,yes,no,no,no,no,2,no
72,51000,3150,3,1,2,yes,no,yes,no,no,0,no
73,32500,1836,2,1,1,no,no,yes,no,no,0,no
74,34000,2475,3,1,2,yes,no,no,no,no,0,no
75,35000,3210,3,1,2,yes,no,yes,no,no,0,no
76,36000,3180,3,1,1,no,no,no,no,no,0,no
77,45000,1650,3,1,2,no,no,yes,no,no,0,no
78,47000,3180,4,1,2,yes,no,yes,no,yes,0,no
79,55000,3180,2,2,1,yes,no,yes,no,no,2,no
80,63900,6360,2,1,1,yes,no,yes,no,yes,1,no
81,50000,4240,3,1,2,yes,no,no,no,yes,0,no
82,35000,3240,2,1,1,no,yes,no,no,no,1,no
83,50000,3650,3,1,2,yes,no,no,no,no,0,no
84,43000,3240,3,1,2,yes,no,no,no,no,2,no
85,55500,3780,2,1,2,yes,yes,yes,no,no,0,no
86,57000,6480,3,1,2,no,no,no,no,yes,1,no
87,60000,5850,2,1,1,yes,yes,yes,no,no,2,no
88,78000,3150,3,2,1,yes,yes,yes,no,yes,0,no
89,35000,3000,2,1,1,yes,no,no,no,no,1,no
90,44000,3090,2,1,1,yes,yes,yes,no,no,0,no
91,47000,6060,3,1,1,yes,yes,yes,no,no,0,no
92,58000,5900,4,2,2,no,no,yes,no,no,1,no
93,163000,7420,4,1,2,yes,yes,yes,no,yes,2,no
94,128000,8500,3,2,4,yes,no,no,no,yes,2,no
95,123500,8050,3,1,1,yes,yes,yes,no,yes,1,no
96,39000,6800,2,1,1,yes,no,no,no,no,0,no
97,53900,8250,3,1,1,yes,no,no,no,no,2,no
98,59900,8250,3,1,1,yes,no,yes,no,no,3,no
99,35000,3500,2,1,1,yes,yes,no,no,no,0,no
100,43000,2835,2,1,1,yes,no,no,no,no,0,no
101,57000,4500,3,2,2,no,no,yes,no,yes,0,no
102,79000,3300,3,3,2,yes,no,yes,no,no,0,no
103,125000,4320,3,1,2,yes,no,yes,yes,no,2,no
104,132000,3500,4,2,2,yes,no,no,yes,no,2,no
105,58000,4992,3,2,2,yes,no,no,no,no,2,no
106,43000,4600,2,1,1,yes,no,no,no,no,0,no
107,48000,3720,2,1,1,no,no,no,no,yes,0,no
108,58500,3680,3,2,2,yes,no,no,no,no,0,no
109,73000,3000,3,2,2,yes,yes,yes,no,no,0,no
110,63500,3750,2,1,1,yes,yes,yes,no,no,0,no
111,43000,5076,3,1,1,no,no,no,no,no,0,no
112,46500,4500,2,1,1,no,no,no,no,no,0,no
113,92000,5000,3,1,2,yes,no,no,no,yes,0,no
114,75000,4260,4,1,2,yes,no,yes,no,yes,0,no
115,75000,6540,4,2,2,no,no,no,no,yes,0,no
116,85000,3700,4,1,2,yes,yes,no,no,yes,0,no
117,93000,3760,3,1,2,yes,no,no,yes,no,2,no
118,94500,4000,3,2,2,yes,no,yes,no,yes,1,no
119,106500,4300,3,2,2,yes,no,yes,no,no,1,no
120,116000,6840,5,1,2,yes,yes,yes,no,yes,1,no
121,61500,4400,2,1,1,yes,no,no,no,no,1,no
122,80000,10500,4,2,2,yes,no,no,no,no,1,no
123,37000,4400,2,1,1,yes,no,no,no,no,0,no
124,59500,4840,3,1,2,yes,no,no,no,no,1,no
125,70000,4120,2,1,1,yes,no,yes,no,no,1,no
126,95000,4260,4,2,2,yes,no,no,yes,no,0,no
127,117000,5960,3,3,2,yes,yes,yes,no,no,1,no
128,122500,8800,3,2,2,yes,no,no,no,yes,2,no
129,123500,4560,3,2,2,yes,yes,yes,no,yes,1,no
130,127000,4600,3,2,2,yes,yes,no,no,yes,2,no
131,35000,4840,2,1,2,yes,no,no,no,no,0,no
132,44500,3850,3,1,2,yes,no,no,no,no,0,no
133,49900,4900,3,1,2,no,no,no,no,no,0,no
134,50500,3850,3,1,1,yes,no,no,no,no,2,no
135,65000,3760,3,1,1,yes,no,no,no,no,2,no
136,90000,6000,4,2,4,yes,no,no,no,no,1,no
137,46000,4370,3,1,2,yes,no,no,no,no,0,no
138,35000,7700,2,1,1,yes,no,no,no,no,0,no
139,26500,2990,2,1,1,no,no,no,no,no,1,no
140,43000,3750,3,1,2,yes,no,no,no,no,0,no
141,56000,3000,3,1,2,yes,no,no,no,no,0,no
142,40000,2650,3,1,2,yes,no,yes,no,no,1,no
143,51000,4500,4,2,2,yes,no,yes,no,no,2,no
144,51000,4500,2,1,1,no,no,no,no,no,0,no
145,57250,4500,3,1,2,no,no,yes,no,yes,0,no
146,44000,4500,2,1,2,yes,no,no,yes,no,1,no
147,61000,2175,3,1,2,no,yes,yes,no,yes,0,no
148,62000,4500,3,2,3,yes,no,no,yes,no,1,no
149,80000,4800,5,2,3,no,no,yes,yes,no,0,no
150,50000,4600,4,1,2,yes,no,no,no,no,0,no
151,59900,3450,3,1,2,yes,no,no,no,no,1,no
152,35500,3000,3,1,2,no,no,no,no,no,0,no
153,37000,3600,2,2,2,yes,no,yes,no,no,1,no
154,42000,3600,3,1,2,no,no,no,no,no,1,no
155,48000,3750,3,1,1,yes,no,no,no,no,0,no
156,60000,2610,4,3,2,no,no,no,no,no,0,no
157,60000,2953,3,1,2,yes,no,yes,no,yes,0,no
158,60000,2747,4,2,2,no,no,no,no,no,0,no
159,62000,1905,5,1,2,no,no,yes,no,no,0,no
160,63000,3968,3,1,2,no,no,no,no,no,0,no
161,63900,3162,3,1,2,yes,no,no,no,yes,1,no
162,130000,6000,4,1,2,yes,no,yes,no,no,2,no
163,25000,2910,3,1,1,no,no,no,no,no,0,no
164,50000,2135,3,2,2,no,no,no,no,no,0,no
165,52900,3120,3,1,2,no,no,yes,yes,no,0,no
166,62000,4075,3,1,1,yes,yes,yes,no,no,2,no
167,73500,3410,3,1,2,no,no,no,no,yes,0,no
168,38000,2800,3,1,1,yes,no,no,no,no,0,no
169,46000,2684,2,1,1,yes,no,no,no,yes,1,no
170,48000,3100,3,1,2,no,no,yes,no,no,0,no
171,52500,3630,2,1,1,yes,no,yes,no,no,0,no
172,32000,1950,3,1,1,no,no,no,yes,no,0,no
173,38000,2430,3,1,1,no,no,no,no,no,0,no
174,46000,4320,3,1,1,no,no,no,no,no,1,no
175,50000,3036,3,1,2,yes,no,yes,no,no,0,no
176,57500,3630,3,2,2,yes,no,no,yes,no,2,no
177,70000,5400,4,1,2,yes,no,no,no,no,0,no
178,69900,3420,4,2,2,yes,no,yes,no,yes,2,no
179,74500,3180,3,2,2,yes,no,no,no,no,2,no
180,42000,3660,4,1,2,no,no,no,no,no,0,no
181,60000,4410,2,1,1,no,no,no,no,no,1,no
182,50000,3990,3,1,2,yes,no,no,no,no,0,no
183,58000,4340,3,1,1,yes,no,no,no,no,0,no
184,63900,3510,3,1,2,yes,no,no,no,no,0,no
185,28000,3420,5,1,2,no,no,no,no,no,0,no
186,54000,3420,2,1,2,yes,no,no,yes,no,1,no
187,44700,5495,3,1,1,yes,no,yes,no,no,0,no
188,47000,3480,4,1,2,no,no,no,no,no,1,no
189,50000,7424,3,1,1,no,no,no,no,no,0,no
190,57250,3460,4,1,2,yes,no,no,no,yes,0,no
191,67000,3630,3,1,2,yes,no,no,no,no,2,no
192,52500,3630,2,1,1,yes,no,no,no,yes,0,no
193,42000,3480,3,1,2,no,no,no,no,no,1,no
194,57500,3460,3,2,1,yes,no,yes,no,yes,1,no
195,33000,3180,2,1,1,yes,no,no,no,no,0,no
196,34400,3635,2,1,1,no,no,no,no,no,0,no
197,40000,3960,3,1,1,yes,no,no,no,no,0,no
198,40500,4350,3,1,2,no,no,no,yes,no,1,no
199,46500,3930,2,1,1,no,no,no,no,no,0,no
200,52000,3570,3,1,2,yes,no,yes,no,no,0,no
201,53000,3600,3,1,1,yes,no,no,no,no,1,no
202,53900,2520,5,2,1,no,no,yes,no,yes,1,no
203,50000,3480,3,1,1,no,no,no,no,yes,0,no
204,55500,3180,4,2,2,yes,no,no,no,no,0,no
205,56000,3290,2,1,1,yes,no,no,yes,no,1,no
206,60000,4000,4,2,2,no,no,no,no,no,0,no
207,60000,2325,3,1,2,no,no,no,no,no,0,no
208,69500,4350,2,1,1,yes,no,yes,no,no,0,no
209,72000,3540,2,1,1,no,yes,yes,no,no,0,no
210,92500,3960,3,1,1,yes,no,yes,no,no,2,no
211,40500,2640,2,1,1,no,no,no,no,no,1,no
212,42000,2700,2,1,1,no,no,no,no,no,0,no
213,47900,2700,3,1,1,no,no,no,no,no,0,no
214,52000,3180,3,1,2,no,no,yes,no,no,0,no
215,62000,3500,4,1,2,yes,no,no,no,no,2,no
216,41000,3630,2,1,1,yes,no,no,no,no,0,no
217,138300,6000,4,3,2,yes,yes,yes,yes,no,2,no
218,42000,3150,3,1,2,no,no,no,no,no,0,no
219,47000,3792,4,1,2,yes,no,no,no,no,0,no
220,64500,3510,3,1,3,yes,no,no,no,no,0,no
221,46000,3120,3,1,2,no,no,no,no,no,0,no
222,58000,3000,4,1,3,yes,no,yes,no,yes,2,no
223,70100,4200,3,1,2,yes,no,no,no,no,1,no
224,78500,2817,4,2,2,no,yes,yes,no,no,1,no
225,87250,3240,4,1,3,yes,no,no,no,no,1,no
226,70800,2800,3,2,2,no,no,yes,no,yes,1,no
227,56000,3816,2,1,1,yes,no,yes,no,yes,2,no
228,48000,3185,2,1,1,yes,no,yes,no,no,2,no
229,68000,6321,3,1,2,yes,no,yes,no,yes,1,no
230,79000,3650,3,2,2,yes,no,no,no,no,2,no
231,80000,4700,4,1,2,yes,yes,yes,no,yes,1,no
232,87000,6615,4,2,2,yes,yes,no,yes,no,1,no
233,25000,3850,3,1,2,yes,no,no,no,no,0,no
234,32500,3970,1,1,1,no,no,no,no,no,0,no
235,36000,3000,2,1,2,yes,no,no,no,no,0,no
236,42500,4352,4,1,2,no,no,no,no,no,1,no
237,43000,3630,4,1,2,yes,no,no,no,no,3,no
238,50000,3600,6,1,2,yes,no,no,no,no,1,no
239,26000,3000,2,1,1,yes,no,yes,no,no,2,no
240,30000,3000,4,1,2,yes,no,no,no,no,0,no
241,34000,2787,4,2,2,yes,no,no,no,no,0,no
242,52000,3000,2,1,2,yes,no,no,no,yes,0,no
243,70000,4770,3,1,1,yes,yes,yes,no,no,0,no
244,27000,3649,2,1,1,yes,no,no,no,no,0,no
245,32500,3970,3,1,2,yes,no,yes,no,no,0,no
246,37200,2910,2,1,1,no,no,no,no,no,0,no
247,38000,3480,2,1,1,yes,no,no,no,no,1,no
248,42000,6615,3,1,2,yes,no,no,no,no,0,no
249,44500,3500,2,1,1,yes,no,no,no,no,0,no
250,45000,3450,3,1,2,yes,no,yes,no,no,0,no
251,48500,3450,3,1,1,yes,no,yes,no,no,2,no
252,52000,3520,2,2,1,yes,no,yes,no,no,0,no
253,53900,6930,4,1,2,no,no,no,no,no,1,no
254,60000,4600,3,2,2,yes,no,no,no,yes,1,no
255,61000,4360,4,1,2,yes,no,no,no,no,0,no
256,64500,3450,3,1,2,yes,no,yes,no,no,1,no
257,71000,4410,4,3,2,yes,no,yes,no,no,2,no
258,75500,4600,2,2,1,yes,no,no,no,yes,2,no
259,33500,3640,2,1,1,yes,no,no,no,no,0,no
260,41000,6000,2,1,1,yes,no,no,no,no,0,no
261,41000,5400,4,1,2,yes,no,no,no,no,0,no
262,46200,3640,4,1,2,yes,no,yes,no,no,0,no
263,48500,3640,2,1,1,yes,no,no,no,no,0,no
264,48900,4040,2,1,1,yes,no,no,no,no,0,no
265,50000,3640,2,1,1,yes,no,no,no,no,1,no
266,51000,3640,2,1,1,yes,no,no,no,no,0,no
267,52500,5640,2,1,1,no,no,no,no,no,0,no
268,52500,3600,2,1,1,yes,no,no,no,no,0,no
269,54000,3600,2,1,1,yes,no,no,no,no,0,no
270,59000,4632,4,1,2,yes,no,no,no,yes,0,no
271,60000,3640,3,2,2,yes,no,yes,no,no,0,no
272,63000,4900,2,1,2,yes,no,yes,no,no,0,no
273,64000,4510,4,1,2,yes,no,no,no,yes,2,no
274,64900,4100,2,2,1,yes,yes,yes,no,no,0,no
275,65000,3640,3,1,2,yes,no,no,no,yes,0,no
276,66000,5680,3,1,2,yes,yes,no,no,yes,1,no
277,70000,6300,3,1,1,yes,no,no,no,yes,2,no
278,65500,4000,3,1,2,yes,no,no,no,no,1,no
279,57000,3960,3,1,2,yes,no,no,no,no,0,no
280,52000,5960,3,1,2,yes,yes,yes,no,no,0,no
281,54000,5830,2,1,1,yes,no,no,no,no,2,no
282,74500,4500,4,2,1,no,no,yes,no,yes,2,no
283,90000,4100,3,2,3,yes,no,no,no,yes,2,no
284,45000,6750,2,1,1,yes,no,no,no,no,0,no
285,45000,9000,3,1,2,yes,no,no,no,no,2,no
286,65000,2550,3,1,2,yes,no,yes,no,no,0,no
287,55000,7152,3,1,2,yes,no,no,no,yes,0,no
288,62000,6450,4,1,2,yes,no,no,no,no,0,no
289,30000,3360,2,1,1,yes,no,no,no,no,1,no
290,34000,3264,2,1,1,yes,no,no,no,no,0,no
291,38000,4000,3,1,1,yes,no,no,no,no,0,no
292,39000,4000,3,1,2,yes,no,no,no,no,1,no
293,45000,3069,2,1,1,yes,no,no,no,no,1,no
294,47000,4040,2,1,1,yes,no,no,no,no,0,no
295,47500,4040,2,1,1,yes,no,no,no,no,1,no
296,49000,3185,2,1,1,yes,no,no,no,no,2,no
297,50000,5900,2,1,1,yes,no,no,no,no,1,no
298,50000,3120,3,1,2,yes,no,no,no,no,1,no
299,52900,5450,2,1,1,yes,no,no,no,no,0,no
300,53000,4040,2,1,1,yes,no,no,no,no,0,no
301,55000,4080,2,1,1,yes,no,no,no,no,0,no
302,56000,8080,3,1,1,yes,no,no,no,yes,2,no
303,58500,4040,2,1,2,yes,no,no,no,no,1,no
304,59500,4080,3,1,2,yes,no,no,no,no,2,no
305,60000,5800,3,1,1,yes,no,no,yes,no,2,no
306,64000,5885,2,1,1,yes,no,no,no,yes,1,no
307,67000,9667,4,2,2,yes,yes,yes,no,no,1,no
308,68100,3420,4,2,2,yes,no,no,no,no,0,no
309,70000,5800,2,1,1,yes,yes,yes,no,yes,0,no
310,72000,7600,4,1,2,yes,no,no,no,yes,2,no
311,57500,5400,3,1,1,yes,no,no,no,no,3,no
312,69900,4995,4,2,1,yes,no,yes,no,no,0,no
313,70000,3000,3,1,2,yes,no,yes,no,yes,0,no
314,75000,5500,3,2,1,yes,no,yes,no,no,0,no
315,76900,6450,3,2,1,yes,yes,yes,yes,no,0,no
316,78000,6210,4,1,4,yes,yes,no,no,yes,0,no
317,80000,5000,3,1,4,yes,no,no,no,no,0,no
318,82000,5000,3,1,3,yes,no,no,no,yes,0,no
319,83000,5828,4,1,4,yes,yes,no,no,no,0,no
320,83000,5200,3,1,3,yes,no,no,no,yes,0,no
321,83900,5500,3,1,3,yes,yes,no,no,yes,1,no
322,88500,6350,3,2,3,yes,yes,no,no,yes,0,no
323,93000,8250,3,2,3,yes,no,no,no,yes,0,no
324,98000,6000,3,1,1,yes,no,no,no,yes,1,no
325,98500,7700,3,2,1,yes,no,no,no,no,2,no
326,99000,8880,3,2,2,yes,no,yes,no,yes,1,no
327,101000,8880,2,1,1,yes,no,no,no,yes,1,no
328,110000,6480,3,2,4,yes,no,no,no,yes,2,no
329,115442,7000,3,2,4,yes,no,no,no,yes,2,no
330,120000,8875,3,1,1,yes,no,no,no,no,1,no
331,124000,7155,3,2,1,yes,yes,yes,no,yes,2,no
332,175000,8960,4,4,4,yes,no,no,no,yes,3,no
333,50000,7350,2,1,1,yes,no,no,no,no,1,no
334,55000,3850,2,1,1,yes,no,no,no,no,0,no
335,60000,7000,3,1,1,yes,no,no,no,no,3,no
336,61000,7770,2,1,1,yes,no,no,no,no,1,no
337,106000,7440,3,2,1,yes,yes,yes,no,yes,0,yes
338,155000,7500,3,3,1,yes,no,yes,no,yes,2,yes
339,141000,8100,4,1,2,yes,yes,yes,no,yes,2,yes
340,62500,3900,3,1,2,yes,no,no,no,no,0,no
341,70000,2970,3,1,3,yes,no,no,no,no,0,no
342,73000,3000,3,1,2,yes,no,yes,no,no,0,no
343,80000,10500,2,1,1,yes,no,no,no,no,1,no
344,80000,5500,3,2,2,yes,no,no,no,no,1,no
345,88000,4500,3,1,4,yes,no,no,no,yes,0,no
346,49000,3850,3,1,1,yes,no,no,no,no,0,no
347,52000,4130,3,2,2,yes,no,no,no,no,2,no
348,59500,4046,3,1,2,yes,no,yes,no,no,1,no
349,60000,4079,3,1,3,yes,no,no,no,no,0,no
350,64000,4000,3,1,2,yes,no,no,no,no,2,no
351,64500,9860,3,1,1,yes,no,no,no,no,0,no
352,68500,7000,3,1,2,yes,no,yes,no,no,0,no
353,78500,7980,3,1,1,yes,no,no,no,no,2,no
354,86000,6800,2,1,1,yes,yes,yes,no,no,2,no
355,86900,4300,6,2,2,yes,no,no,no,no,0,no
356,75000,10269,3,1,1,yes,no,no,no,no,1,yes
357,78000,6100,3,1,3,yes,yes,no,no,yes,0,yes
358,95000,6420,3,2,3,yes,no,no,no,yes,0,yes
359,97000,12090,4,2,2,yes,no,no,no,no,2,yes
360,107000,6600,3,1,4,yes,no,no,no,yes,3,yes
361,130000,6600,4,2,2,yes,yes,yes,no,yes,1,yes
362,145000,8580,4,3,4,yes,no,no,no,yes,2,yes
363,175000,9960,3,2,2,yes,no,yes,no,no,2,yes
364,72000,10700,3,1,2,yes,yes,yes,no,no,0,no
365,84900,15600,3,1,1,yes,no,no,no,yes,2,no
366,99000,13200,2,1,1,yes,no,yes,yes,no,1,no
367,114000,9000,4,2,4,yes,no,no,no,yes,2,no
368,120000,7950,5,2,2,yes,no,yes,yes,no,2,no
369,145000,16200,5,3,2,yes,no,no,no,no,0,no
370,79000,6100,3,2,1,yes,no,yes,no,no,2,yes
371,82000,6360,3,1,1,yes,yes,yes,no,yes,2,yes
372,85000,6420,3,1,1,yes,no,yes,no,yes,0,yes
373,100500,6360,4,2,3,yes,no,no,no,yes,2,yes
374,122000,6540,4,2,2,yes,yes,yes,no,yes,2,yes
375,126500,6420,3,2,2,yes,no,no,no,yes,1,yes
376,133000,6550,4,2,2,yes,no,no,no,yes,1,yes
377,140000,5750,3,2,4,yes,yes,no,no,yes,1,yes
378,190000,7420,4,2,3,yes,no,no,no,yes,2,yes
379,84000,7160,3,1,1,yes,no,yes,no,no,2,yes
380,97000,4000,3,2,2,yes,no,yes,no,yes,0,yes
381,103500,9000,4,2,4,yes,yes,no,no,yes,1,yes
382,112500,6550,3,1,2,yes,no,yes,no,yes,0,yes
383,140000,13200,3,1,2,yes,no,yes,no,yes,2,yes
384,74700,7085,3,1,1,yes,yes,yes,no,no,2,yes
385,78000,6600,4,2,2,yes,yes,yes,no,no,0,yes
386,78900,6900,3,1,1,yes,yes,yes,no,no,0,yes
387,83900,11460,3,1,3,yes,no,no,no,no,2,yes
388,85000,7020,3,1,1,yes,no,yes,no,yes,2,yes
389,85000,6540,3,1,1,yes,yes,yes,no,no,2,yes
390,86000,8000,3,1,1,yes,yes,yes,no,yes,2,yes
391,86900,9620,3,1,1,yes,no,yes,no,no,2,yes
392,94500,10500,3,2,1,yes,no,yes,no,yes,1,yes
393,96000,5020,3,1,4,yes,no,no,no,yes,0,yes
394,106000,7440,3,2,4,yes,no,no,no,no,1,yes
395,72000,6600,3,1,1,yes,yes,yes,no,no,0,yes
396,74500,7200,3,1,2,yes,yes,yes,no,no,1,yes
397,77000,6710,3,2,2,yes,yes,yes,no,no,1,yes
398,80750,6660,4,2,2,yes,yes,yes,no,no,1,yes
399,82900,7000,3,1,1,yes,no,yes,no,no,2,yes
400,85000,7231,3,1,2,yes,yes,yes,no,yes,0,yes
401,92500,7410,3,1,1,yes,yes,yes,no,yes,2,yes
402,76000,7800,3,1,1,yes,no,yes,no,yes,2,yes
403,77500,6825,3,1,1,yes,yes,yes,no,yes,0,yes
404,80000,6360,3,1,3,yes,no,no,no,no,0,yes
405,80000,6600,4,2,1,yes,no,yes,no,no,0,yes
406,86000,6900,3,2,1,yes,yes,yes,no,no,0,yes
407,87000,6600,3,1,1,yes,yes,yes,no,no,2,yes
408,87500,6420,3,1,3,yes,no,yes,no,no,0,yes
409,89000,6600,3,2,1,yes,no,yes,no,yes,0,yes
410,89900,6600,3,2,3,yes,no,no,no,yes,0,yes
411,90000,9000,3,1,1,yes,no,yes,no,no,1,yes
412,95000,6500,3,2,3,yes,no,no,no,yes,0,yes
413,112000,6360,3,2,4,yes,no,no,no,yes,0,yes
414,31900,5300,3,1,1,no,no,no,no,yes,0,yes
415,52000,2850,3,2,2,no,no,yes,no,no,0,yes
416,90000,6400,3,1,1,yes,yes,yes,no,yes,1,yes
417,100000,11175,3,1,1,yes,no,yes,no,yes,1,yes
418,91700,6750,2,1,1,yes,yes,yes,no,no,2,yes
419,174500,7500,4,2,2,yes,no,yes,no,yes,3,yes
420,94700,6000,3,1,2,yes,no,no,yes,no,1,yes
421,68000,10240,2,1,1,yes,no,no,no,yes,2,yes
422,80000,5136,3,1,2,yes,yes,yes,no,yes,0,yes
423,61100,3400,3,1,2,yes,no,yes,no,no,2,yes
424,62900,2880,3,1,2,yes,no,no,no,no,0,yes
425,65500,3840,3,1,2,yes,no,no,no,no,1,yes
426,66000,2870,2,1,2,yes,yes,yes,no,no,0,yes
427,49500,5320,2,1,1,yes,no,no,no,no,1,yes
428,50000,3512,2,1,1,yes,no,no,no,no,1,yes
429,53500,3480,2,1,1,yes,no,no,no,no,0,yes
430,58550,3600,3,1,1,yes,no,yes,no,yes,0,yes
431,64500,3520,2,1,2,yes,no,no,no,no,0,yes
432,65000,5320,3,1,2,yes,yes,yes,no,no,0,yes
433,69000,6040,3,1,1,yes,no,no,no,no,2,yes
434,73000,11410,2,1,2,yes,no,no,no,no,0,yes
435,75000,8400,3,1,2,yes,yes,yes,no,yes,2,yes
436,75000,5300,4,2,1,yes,no,no,no,yes,0,yes
437,132000,7800,3,2,2,yes,no,no,no,no,0,yes
438,60000,3520,3,1,2,yes,no,no,no,no,0,yes
439,65000,5360,3,1,2,yes,no,no,no,no,2,yes
440,69000,6862,3,1,2,yes,no,no,no,yes,2,yes
441,51900,3520,3,1,1,yes,no,no,no,no,2,yes
442,57000,4050,2,1,2,yes,yes,yes,no,no,0,yes
443,65000,3520,3,1,1,yes,no,no,no,no,0,yes
444,79500,4400,4,1,2,yes,no,no,no,yes,2,yes
445,72500,5720,2,1,2,yes,no,no,no,yes,0,yes
446,104900,11440,4,1,2,yes,no,yes,no,no,1,yes
447,114900,7482,3,2,3,yes,no,no,yes,no,1,yes
448,120000,5500,4,2,2,yes,no,yes,no,yes,1,yes
449,58000,4320,3,1,2,yes,no,no,no,no,2,yes
450,67000,5400,2,1,2,yes,no,no,no,no,0,yes
451,67000,4320,3,1,1,yes,no,no,no,no,0,yes
452,69000,4815,2,1,1,yes,no,no,no,yes,0,yes
453,73000,6100,3,1,1,yes,no,yes,no,yes,0,yes
454,73500,7980,3,1,1,yes,no,no,no,no,1,yes
455,74900,6050,3,1,1,yes,no,yes,no,no,0,yes
456,75000,3800,3,1,2,yes,yes,yes,no,no,1,yes
457,79500,5400,5,1,2,yes,yes,yes,no,yes,0,yes
458,120900,6000,3,2,4,yes,yes,yes,no,yes,0,yes
459,44555,2398,3,1,1,yes,no,no,no,no,0,yes
460,47000,2145,3,1,2,yes,no,yes,no,no,0,yes
461,47600,2145,3,1,2,yes,no,yes,no,no,0,yes
462,49000,2145,3,1,3,yes,no,no,no,no,0,yes
463,49000,2610,3,1,2,yes,no,yes,no,no,0,yes
464,49000,1950,3,2,2,yes,no,yes,no,no,0,yes
465,49500,2145,3,1,3,yes,no,no,no,no,0,yes
466,52000,2275,3,1,3,yes,no,no,yes,yes,0,yes
467,54000,2856,3,1,3,yes,no,no,no,no,0,yes
468,55000,2015,3,1,2,yes,no,yes,no,no,0,yes
469,55000,2176,2,1,2,yes,yes,no,no,no,0,yes
470,56000,2145,4,2,1,yes,no,yes,no,no,0,yes
471,60000,2145,3,1,3,yes,no,no,no,no,1,yes
472,60500,2787,3,1,1,yes,no,yes,no,no,0,yes
473,50000,9500,3,1,2,yes,no,no,no,no,3,yes
474,64900,4990,4,2,2,yes,yes,yes,no,no,0,yes
475,93000,6670,3,1,3,yes,no,yes,no,no,0,yes
476,85000,6254,4,2,1,yes,no,yes,no,no,1,yes
477,61500,10360,2,1,1,yes,no,no,no,no,1,yes
478,88500,5500,3,2,1,yes,yes,yes,no,no,2,yes
479,88000,5450,4,2,1,yes,no,yes,no,yes,0,yes
480,89000,5500,3,1,3,yes,no,no,no,no,1,yes
481,89500,6000,4,1,3,yes,yes,yes,no,no,0,yes
482,95000,5700,3,1,1,yes,yes,yes,no,yes,2,yes
483,95500,6600,2,2,4,yes,no,yes,no,no,0,yes
484,51500,4000,2,1,1,yes,no,no,no,no,0,yes
485,62900,4880,3,1,1,yes,no,no,no,no,2,yes
486,118500,4880,4,2,2,yes,no,no,no,yes,1,yes
487,42900,8050,2,1,1,yes,no,no,no,no,0,no
488,44100,8100,2,1,1,yes,no,no,no,no,1,no
489,47000,5880,3,1,1,yes,no,no,no,no,1,no
490,50000,5880,2,1,1,yes,no,no,no,no,0,no
491,50000,12944,3,1,1,yes,no,no,no,no,0,no
492,53000,6020,3,1,1,yes,no,no,no,no,0,no
493,53000,4050,2,1,1,yes,no,no,no,no,0,no
494,54000,8400,2,1,1,yes,no,no,no,no,1,no
495,58500,5600,2,1,1,yes,no,no,no,yes,0,no
496,59000,5985,3,1,1,yes,no,yes,no,no,0,no
497,60000,4500,3,1,1,yes,no,yes,no,no,0,no
498,62900,4920,3,1,2,yes,no,no,no,no,1,no
499,64000,8250,3,1,1,yes,no,no,no,no,0,no
500,65000,8400,4,1,4,yes,no,no,no,no,3,no
501,67900,6440,2,1,1,yes,no,no,no,yes,3,no
502,68500,8100,4,1,4,yes,no,yes,no,yes,2,no
503,70000,6720,3,1,1,yes,no,no,no,no,0,no
504,70500,5948,3,1,2,yes,no,no,no,yes,0,no
505,71500,8150,3,2,1,yes,yes,yes,no,no,0,no
506,71900,4800,2,1,1,yes,yes,yes,no,no,0,no
507,75000,9800,4,2,2,yes,yes,no,no,no,2,no
508,75000,8520,3,1,1,yes,no,no,no,yes,2,no
509,87000,8372,3,1,3,yes,no,no,no,yes,2,no
510,64000,4040,3,1,2,yes,no,no,no,no,1,no
511,70000,4646,3,1,2,yes,yes,yes,no,no,2,no
512,47500,4775,4,1,2,yes,no,no,no,no,0,no
513,62600,4950,4,1,2,yes,no,no,no,yes,0,no
514,66000,5010,3,1,2,yes,no,yes,no,no,0,no
515,58900,6060,2,1,1,yes,no,yes,no,no,1,no
516,53000,3584,2,1,1,yes,no,no,yes,no,0,no
517,95000,6000,3,2,3,yes,yes,no,no,yes,0,no
518,96500,6000,4,2,4,yes,no,no,no,yes,0,no
519,101000,6240,4,2,2,yes,no,no,no,yes,1,no
520,102000,6000,3,2,2,yes,yes,no,no,no,1,no
521,103000,7680,4,2,4,yes,yes,no,no,yes,1,no
522,105000,6000,4,2,4,yes,yes,no,no,yes,1,no
523,108000,6000,4,2,4,yes,no,no,no,yes,1,no
524,110000,6000,4,2,4,yes,no,no,no,no,2,no
525,113000,6000,4,2,4,yes,no,no,no,yes,1,no
526,120000,7475,3,2,4,yes,no,no,no,yes,2,no
527,105000,5150,3,2,4,yes,no,no,no,yes,2,no
528,106000,6325,3,1,4,yes,no,no,no,yes,1,no
529,107500,6000,3,2,4,yes,no,no,no,yes,1,no
530,108000,6000,3,2,3,yes,no,no,no,yes,0,no
531,113750,6000,3,1,4,yes,yes,no,no,yes,2,no
532,120000,7000,3,1,4,yes,no,no,no,yes,2,no
533,70000,12900,3,1,1,yes,no,no,no,no,2,no
534,71000,7686,3,1,1,yes,yes,yes,yes,no,0,no
535,82000,5000,3,1,3,yes,no,no,no,yes,0,no
536,82000,5800,3,2,4,yes,no,no,no,yes,0,no
537,82500,6000,3,2,4,yes,no,no,no,yes,0,no
538,83000,4800,3,1,3,yes,no,no,no,yes,0,no
539,84000,6500,3,2,3,yes,no,no,no,yes,0,no
540,85000,7320,4,2,2,yes,no,no,no,no,0,no
541,85000,6525,3,2,4,yes,no,no,no,no,1,no
542,91500,4800,3,2,4,yes,yes,no,no,yes,0,no
543,94000,6000,3,2,4,yes,no,no,no,yes,0,no
544,103000,6000,3,2,4,yes,yes,no,no,yes,1,no
545,105000,6000,3,2,2,yes,yes,no,no,yes,1,no
546,105000,6000,3,1,2,yes,no,no,no,yes,1,no`;
        }

        /* ---- INICIAR ---- */
        initPyodide();
        // ---- PARSEO DEL CSV ----
        // Convierte el string CSV en array de objetos
        // Resultado: [ {rownames:'1', price:'42000', lotsize:'5850', ...}, ... ]
        function parseCSV(csvString) {
            const lines = csvString.trim().split('\n');
            const headers = lines[0].split(',');
            return lines.slice(1).map(line => {
                const values = line.split(',');
                const row = {};
                headers.forEach((h, i) => row[h.trim()] = values[i]?.trim() ?? '');
                return row;
            });
        }

        // Variable global: array con las 546 filas ya parseadas
        // Se llena en initSeccion2() y se usa en la tabla y las stats
        window.AppState.csvRows = [];


        // ---- ESTADÍSTICAS DESCRIPTIVAS ----
        // Calcula y renderiza las 4 tarjetas de stats del dataset
        function renderStats(rows) {
            const prices = rows.map(r => parseInt(r.price));
            const lots = rows.map(r => parseInt(r.lotsize));

            const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');

            const stats = [
                { label: 'Total de casas', value: rows.length, sub: 'registros en el dataset', color: '' },
                { label: 'Precio mínimo', value: fmt(Math.min(...prices)), sub: 'casa más barata', color: '' },
                { label: 'Precio máximo', value: fmt(Math.max(...prices)), sub: 'casa más cara', color: '' },
                { label: 'Precio promedio', value: fmt(prices.reduce((a, b) => a + b, 0) / prices.length), sub: 'media del dataset', color: '' },
                { label: 'Lotsize mínimo', value: Math.min(...lots) + ' ft²', sub: 'lote más pequeño', color: '' },
                { label: 'Lotsize máximo', value: Math.max(...lots) + ' ft²', sub: 'lote más grande', color: '' },
                { label: 'Columnas', value: Object.keys(rows[0]).length, sub: 'variables por casa' }

            ];

            document.getElementById('stats-grid').innerHTML = stats
                .map(s => `
      <div class='stat-card'>
        <div class='stat-label'>${s.label}</div>
        <div class='stat-value'>${s.value}</div>
        <div class='stat-sub'>${s.sub}</div>
      </div>`
                ).join('');
        }
        // ---- TABLA PAGINADA ----
        let currentPage = 0;
        const ROWS_PER_PAGE = 20;

        function renderTabla(rows) {
            const start = currentPage * ROWS_PER_PAGE;
            const end = Math.min(start + ROWS_PER_PAGE, rows.length);
            const slice = rows.slice(start, end);
            const total = Math.ceil(rows.length / ROWS_PER_PAGE);

            // Columnas a mostrar (no mostramos 'rownames')
            const cols = ['price', 'lotsize', 'bedrooms', 'bathrms', 'stories',
                'driveway', 'recroom', 'fullbase', 'gashw', 'airco',
                'garagepl', 'prefarea'];

            // Encabezado
            document.getElementById('table-head').innerHTML =
                '<tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr>';

            // Filas — resaltar price y lotsize
            document.getElementById('table-body').innerHTML = slice.map(row =>
                '<tr>' + cols.map(c => {
                    const highlight = (c === 'price' || c === 'lotsize') ? ' class="highlight"' : '';
                    return `<td${highlight}>${row[c]}</td>`;
                }).join('') + '</tr>'
            ).join('');

            // Actualizar controles de paginación
            document.getElementById('page-info').textContent =
                `Mostrando filas ${start + 1}–${end} de ${rows.length}`;
            document.getElementById('btn-prev').disabled = currentPage === 0;
            document.getElementById('btn-next').disabled = currentPage >= total - 1;
        }

        function tablaPrev() {
            if (currentPage > 0) { currentPage--; renderTabla(window.AppState.csvRows); }
        }
        function tablaSig() {
            const total = Math.ceil(window.AppState.csvRows.length / ROWS_PER_PAGE);
            if (currentPage < total - 1) { currentPage++; renderTabla(window.AppState.csvRows); }
        }
        // ---- SCATTER PLOT CON MATPLOTLIB ----
        async function renderScatter() {
            const plotDiv = document.getElementById('scatter-plot');
            plotDiv.innerHTML = '<p class="plot-status">Generando gráfico con Python...</p>';

            try {
                const py = window.AppState.pyodide;

                // Código Python que se ejecuta en el browser
                const base64img = await py.runPythonAsync(`
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Backend sin pantalla (obligatorio en browser)
import matplotlib.pyplot as plt
import io, base64

data = pd.read_csv('/Housing.csv')

fig, ax = plt.subplots(figsize=(8, 4.5))
fig.patch.set_facecolor('#161b22')   # --surface
ax.set_facecolor('#161b22')

ax.scatter(data['lotsize'], data['price'],
           alpha=0.5, color='#58a6ff', s=18, linewidths=0)

ax.set_xlabel('lotsize (ft²)', color='#8b949e', fontsize=10)
ax.set_ylabel('price ($)',     color='#8b949e', fontsize=10)
ax.set_title('lotsize vs. price — Housing Dataset',
             color='#e6edf3', fontsize=12, pad=12)

ax.tick_params(colors='#8b949e')
for spine in ax.spines.values(): spine.set_edgecolor('#30363d')
ax.grid(True, color='#30363d', linewidth=0.5, linestyle='--')

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=120,
            bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
base64.b64encode(buf.read()).decode('utf-8')
    `);

                // Insertar la imagen en el DOM
                plotDiv.innerHTML =
                    `<img src='data:image/png;base64,${base64img}'
            alt='Scatter plot: lotsize vs price' />
       <p class='plot-status'>
         Generado con matplotlib en Python — ${new Date().toLocaleTimeString()}
       </p>`;

            } catch (err) {
                plotDiv.innerHTML =
                    `<p class='plot-status' style='color:var(--accent3)'>
         Error al generar el gráfico: ${err.message}
       </p>`;
                console.error('renderScatter error:', err);
            }
        }
        async function renderScatterBedrooms() {

            const plotDiv = document.getElementById('scatter-bedrooms');
            plotDiv.innerHTML = '<p class="plot-status">Generando gráfico con Python...</p>';

            try {
                const py = window.AppState.pyodide;

                // Código Python que se ejecuta en el browser
                const base64img = await py.runPythonAsync(`
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Backend sin pantalla (obligatorio en browser)
import matplotlib.pyplot as plt
import io, base64

data = pd.read_csv('/Housing.csv')

fig, ax = plt.subplots(figsize=(8, 4.5))
fig.patch.set_facecolor('#161b22')   # --surface
ax.set_facecolor('#161b22')

ax.scatter(data['bedrooms'], data['price'],
           alpha=0.5, color='#58a6ff', s=18, linewidths=0)

ax.set_xlabel('bedrooms (ft²)', color='#8b949e', fontsize=10)
ax.set_ylabel('price ($)',     color='#8b949e', fontsize=10)
ax.set_title('bedrooms vs. price — Housing Dataset',
             color='#e6edf3', fontsize=12, pad=12)

ax.tick_params(colors='#8b949e')
for spine in ax.spines.values(): spine.set_edgecolor('#30363d')
ax.grid(True, color='#30363d', linewidth=0.5, linestyle='--')

buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=120,
            bbox_inches='tight', facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
base64.b64encode(buf.read()).decode('utf-8')
    `);

                // Insertar la imagen en el DOM
                plotDiv.innerHTML =
                    `<img src='data:image/png;base64,${base64img}'
            alt='Scatter plot: lotsize vs price' />
       <p class='plot-status'>
         Generado con matplotlib en Python — ${new Date().toLocaleTimeString()}
       </p>`;

            } catch (err) {
                plotDiv.innerHTML =
                    `<p class='plot-status' style='color:var(--accent3)'>
         Error al generar el gráfico: ${err.message}
       </p>`;
                console.error('renderScatter error:', err);
            }
        }

        // ---- COORDINADOR DE LA SECCIÓN 2 ----
        // Orquesta la carga de datos, stats, tabla y gráfico
        async function initSeccion2() {
            // 1. Parsear el CSV en memoria (JS, sin Python)
            const rows = parseCSV(getCSVData());
            window.AppState.csvRows = rows;

            // 2. Renderizar estadísticas
            renderStats(rows);

            // 3. Renderizar tabla paginada
            renderTabla(rows);

            // 4. Generar scatter plot (requiere Pyodide)
            await renderScatter();
            // 5. Generar scatter plot bedrooms vs price
            await renderScatterBedrooms();
        }

        // Escuchar el evento que lanza initPyodide() cuando Python está listo
        // (Este listener ya aprovecha el dispatchEvent de la Guía 1)
        window.addEventListener('pyodide-ready', () => {
            initSeccion2();
        });
        function aplicarFiltro() {
            const min = parseInt(document.getElementById('filter-min').value) || 0;
            const max = parseInt(document.getElementById('filter-max').value) || Infinity;
            const filtered = window.AppState.csvRows.filter(r => {
                const price = parseInt(r.price);
                return price >= min && price <= max;
            });
            currentPage = 0;
            renderTabla(filtered);
        }

        function limpiarFiltro() {
            document.getElementById('filter-min').value = '';
            document.getElementById('filter-max').value = '';
            currentPage = 0;
            renderTabla(window.AppState.csvRows);
        }
        // ---- CÓDIGO PYTHON DE CADA BLOQUE ----
        // Objeto que mapea id de bloque → código Python a mostrar en el editor
        const BLOQUES = {
            '1': `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
print('Librerías importadas correctamente.')`,

            '2': `data = pd.read_csv('/Housing.csv')
X = data['lotsize']
y = data['price']
print('Dataset cargado:', data.shape)
print(data[['price','lotsize','bedrooms']].head(8).to_string())`,

            '3': `fig, ax = plt.subplots(figsize=(7, 4))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')
ax.scatter(X, y, alpha=0.5, color='#58a6ff', s=18, linewidths=0)
ax.set_xlabel('lotsize (ft²)', color='#8b949e')
ax.set_ylabel('price ($)',     color='#8b949e')
ax.set_title('lotsize vs. price', color='#e6edf3', pad=10)
ax.tick_params(colors='#8b949e')
for spine in ax.spines.values(): spine.set_edgecolor('#30363d')
ax.grid(True, color='#30363d', linewidth=0.5, linestyle='--')
buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=110, bbox_inches='tight',
            facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
base64.b64encode(buf.read()).decode('utf-8')`,

            '4': `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
model = LinearRegression()
model.fit(X_train.values.reshape(-1, 1), y_train)
print(f'Entrenamiento: {len(X_train)} muestras')
print(f'Prueba:        {len(X_test)} muestras')
print(f'Pendiente (a): {model.coef_[0]:.4f}')
print(f'Intercepto (b): {model.intercept_:.2f}')`,

            '5': `y_pred = model.predict(X_test.values.reshape(-1, 1))
mse = mean_squared_error(y_test, y_pred)
r2  = r2_score(y_test, y_pred)
print(f'MSE : {mse:,.2f}')
print(f'RMSE: {mse**0.5:,.2f}  (raiz del MSE, en dolares)')
print(f'R²  : {r2:.4f}')

# Guardar resultados en AppState para la Sección 5 (Reporte)
import js, json
js.window.AppState.lastResults = js.JSON.parse(json.dumps({'mse': mse, 'r2': r2}))`,
            '6': `a = model.coef_[0]
b = model.intercept_
print(f'Ecuación del modelo:')
print(f'  price = {a:.4f} × lotsize + {b:.2f}')
print()
print(f'Interpretación:')
print(f'  Por cada pie² adicional de lote, el precio sube {a:.2f}')`
        };
        // ---- INICIALIZAR EDITORES CODEMIRROR ----
        // Crea un editor en cada div.cm-wrap con el código del bloque
        function initEditores() {
            const { EditorView, basicSetup, python, oneDark } = window.CMModules;

            // Almacén de instancias de editor: { '1': EditorView, '2': EditorView, ... }
            window.AppState.editors = {};

            Object.keys(BLOQUES).forEach(id => {
                const container = document.getElementById('cm-' + id);
                if (!container) return; // saltar si el div no existe aún

                const view = new EditorView({
                    doc: BLOQUES[id],          // código inicial del bloque
                    extensions: [
                        basicSetup,              // numeración, indentación, undo/redo
                        python(),                // syntax highlighting de Python
                        oneDark,                 // tema oscuro
                        EditorView.lineWrapping, // wrap de líneas largas
                    ],
                    parent: container,         // montar dentro del div.cm-wrap
                });

                window.AppState.editors[id] = view;
            });
        }
        // ---- EJECUTAR UN BLOQUE ----
        async function runBlock(id) {
            // Verificar que Pyodide esté listo
            if (!window.AppState.pyodideReady) {
                alert('Python todavía está cargando. Espera el punto verde en el menú.');
                return;
            }

            const outputEl = document.getElementById('output-' + id);
            const statusEl = document.getElementById('status-' + id);
            const btnEl = document.querySelector(`#block-${id} .btn-run`);

            // Leer el código ACTUAL del editor (puede haber sido modificado)
            const codigo = window.AppState.editors[id].state.doc.toString();

            // Actualizar UI: estado 'ejecutando'
            outputEl.className = 'block-output running';
            outputEl.textContent = 'Ejecutando...';
            statusEl.textContent = '⏳ ejecutando...';
            btnEl.disabled = true;

            try {
                const py = window.AppState.pyodide;

                // Capturar el print() de Python redirigiendo stdout
                py.runPython(`
import sys, io as _io
_stdout_buf = _io.StringIO()
sys.stdout = _stdout_buf
    `);

                // Ejecutar el código del bloque
                const resultado = await py.runPythonAsync(codigo);

                // Recuperar lo que se imprimió con print()
                const printOutput = py.runPython(`
sys.stdout = sys.__stdout__
_stdout_buf.getvalue()
    `);

                // Decidir qué mostrar: imagen o texto
                if (typeof resultado === 'string' && resultado.length > 100
                    && !resultado.includes(' ')) {
                    // Es base64 — mostrar como imagen
                    outputEl.className = 'block-output success';
                    outputEl.innerHTML =
                        (printOutput ? `<span>${printOutput}</span>` : '') +
                        `<img src='data:image/png;base64,${resultado}' alt='gráfico' />`;
                } else {
                    // Es texto normal
                    const textoFinal = printOutput ||
                        (resultado !== undefined && resultado !== null
                            ? String(resultado) : '(sin output)');
                    outputEl.className = 'block-output success';
                    outputEl.textContent = textoFinal;
                }

                statusEl.textContent = '✅ completado';

                // Actualizar barra de progreso global de bloques
                if (window.NT && window.NT.markBlockDone) window.NT.markBlockDone(id);

            } catch (err) {
                // Restaurar stdout aunque haya error
                try { window.AppState.pyodide.runPython('sys.stdout = sys.__stdout__'); }
                catch (_) { }

                outputEl.className = 'block-output error';
                outputEl.textContent = '❌ Error Python:\n' + err.message;
                statusEl.textContent = '❌ error';

            } finally {
                btnEl.disabled = false;
            }
        }
        // ---- COORDINADOR DE LA SECCIÓN 3 ----
        // Necesita esperar AMBOS eventos: pyodide-ready Y codemirror-ready
        let _s3PyReady = false;
        let _s3CmReady = false;

        function _tryInitS3() {
            console.log('tryInitS3 — py:', _s3PyReady, '| cm:', _s3CmReady);
            // Crear editores apenas CodeMirror esté listo (sin esperar a Pyodide ni al click).
            // Esto evita problemas de timing al montar sobre contenedores ocultos.
            if (_s3CmReady && !_editoresCreados) {
                _editoresCreados = true;
                initEditores();
            }
        }

        // Escuchar Pyodide (puede ya estar listo si la sección carga tarde)
        if (window.AppState.pyodideReady) {
            _s3PyReady = true;
        } else {
            window.addEventListener('pyodide-ready', () => {
                _s3PyReady = true;
                _tryInitS3();
            });
        }

        // Escuchar CodeMirror
        window.addEventListener('codemirror-ready', () => {
            _s3CmReady = true;
            _tryInitS3();
        });

        // Caso borde: CodeMirror ya estaba listo antes del listener
        if (window.CMModules) {
            _s3CmReady = true;
            _tryInitS3();
        }

        // Función para restablecer el código original de un bloque
        function resetBlock(id) {
            const view = window.AppState.editors[id];
            const codigo = BLOQUES[id];
            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: codigo,
                }
            });
            document.getElementById('output-' + id).className = 'block-output';
            document.getElementById('output-' + id).textContent = 'Código restablecido.';
            document.getElementById('status-' + id).textContent = '';
        }

        async function runAll() {
            for (const id of ['1', '2', '3', '4', '5', '6']) {
                await runBlock(id);
                // Pequeña pausa entre bloques para que la UI pueda actualizarse
                await new Promise(r => setTimeout(r, 200));
            }
        }
        // ---- CÓDIGO INICIAL DEL PLAYGROUND ----
        // Es el código completo del proyecto en un solo bloque editable
        const CODIGO_PLAYGROUND = `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64

# Cargar datos
data = pd.read_csv('/Housing.csv')
X = data['lotsize']
y = data['price']

# Dividir el dataset (puedes cambiar test_size y random_state)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Crear y entrenar el modelo
model = LinearRegression()
model.fit(X_train.values.reshape(-1, 1), y_train)

# Predicción y métricas
y_pred = model.predict(X_test.values.reshape(-1, 1))
mse = mean_squared_error(y_test, y_pred)
r2  = r2_score(y_test, y_pred)
print(f'MSE : {mse:,.2f}')
print(f'RMSE: {mse**0.5:,.2f}')
print(f'R²  : {r2:.4f}')

# Gráfico: valores reales vs predicciones
fig, ax = plt.subplots(figsize=(5, 4))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')
ax.scatter(y_test, y_pred, alpha=0.6, color='#58a6ff', s=20)
x_line = [y_test.min(), y_test.max()]
ax.plot(x_line, x_line, color='#3fb950', linewidth=1.5, linestyle='--')
ax.set_xlabel('Valores reales',  color='#8b949e', fontsize=9)
ax.set_ylabel('Predicciones',    color='#8b949e', fontsize=9)
ax.set_title('Reales vs Predicciones', color='#e6edf3', fontsize=11, pad=8)
ax.tick_params(colors='#8b949e', labelsize=8)
for spine in ax.spines.values(): spine.set_edgecolor('#30363d')
ax.grid(True, color='#30363d', linewidth=0.4, linestyle='--')
buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=110, bbox_inches='tight',
            facecolor=fig.get_facecolor())
plt.close()
buf.seek(0)
__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')

__coef__      = float(model.coef_[0])
__intercept__ = float(model.intercept_)

# Guardar métricas en AppState para el Reporte
import js, json
js.window.AppState.lastResults = js.JSON.parse(json.dumps({'mse': float(mse), 'r2': float(r2)}))`;

        // Variable para la instancia del editor del Playground
        // Se llena en initPlayground()
        window.AppState.playgroundEditor = null;
        // ---- INICIALIZAR EDITOR DEL PLAYGROUND ----
        function initPlayground() {
            const { EditorView, basicSetup, python, oneDark } = window.CMModules;
            const container = document.getElementById('cm-playground');
            if (!container) return;

            window.AppState.playgroundEditor = new EditorView({
                doc: CODIGO_PLAYGROUND,
                extensions: [
                    basicSetup,
                    python(),
                    oneDark,
                    EditorView.lineWrapping,
                ],
                parent: container,
            });
        }
        // ---- EJECUTAR EL PLAYGROUND ----
        async function runPlayground() {
            if (!window.AppState.pyodideReady) {
                alert('Python todavía está cargando. Espera el punto verde.');
                return;
            }

            const consoleEl = document.getElementById('pg-console');
            const statusEl = document.getElementById('pg-status');
            const btnEl = document.getElementById('btn-pg-run');
            const plotEl = document.getElementById('pg-plot');

            // Leer código actual del editor
            const codigo = window.AppState.playgroundEditor.state.doc.toString();

            // UI: estado ejecutando
            consoleEl.className = 'pg-console';
            consoleEl.textContent = 'Ejecutando...';
            statusEl.textContent = '⏳ Ejecutando el modelo...';
            btnEl.disabled = true;
            document.getElementById('val-mse').textContent = '...';
            document.getElementById('val-r2').textContent = '...';
            // Marcar métricas como "updating" (color ámbar)
            document.getElementById('metric-mse').classList.add('updating');
            document.getElementById('metric-r2').classList.add('updating');

            try {
                const py = window.AppState.pyodide;

                // Redirigir stdout para capturar print()
                py.runPython(`
import sys, io as _io
_stdout_buf = _io.StringIO()
sys.stdout = _stdout_buf
    `);

                // Ejecutar el código completo
                await py.runPythonAsync(codigo);

                // Recuperar print() output
                const printOutput = py.runPython(`
sys.stdout = sys.__stdout__
_stdout_buf.getvalue()
    `);

                // Mostrar consola
                consoleEl.className = 'pg-console ok';
                consoleEl.textContent = printOutput || '(sin output de print)';

                // Recuperar el gráfico base64
                let plotB64 = null;
                try {
                    plotB64 = py.globals.get('__plot_b64__');
                } catch (_) { }

                let coef = null, intercept = null;
                try {
                    coef = py.globals.get('__coef__');
                    intercept = py.globals.get('__intercept__');
                } catch (_) { }

                if (plotB64) {
                    plotEl.innerHTML =
                        `<img src='data:image/png;base64,${plotB64}'
             alt='Reales vs Predicciones' />`;
                }

                // Leer métricas desde AppState (las guardó el código Python)
                const results = window.AppState.lastResults;
                if (results) {
                    const mse = results.mse ?? results.get?.('mse');
                    const r2 = results.r2 ?? results.get?.('r2');

                    // Quitar el estado "updating" (ámbar) ahora que tenemos valor
                    document.getElementById('metric-mse').classList.remove('updating');
                    document.getElementById('metric-r2').classList.remove('updating');

                    // Actualizar tarjetas de métricas con counter animado
                    const mseEl = document.getElementById('val-mse');
                    const r2El = document.getElementById('val-r2');
                    if (window.NT && window.NT.animateCounter && typeof mse === 'number') {
                        window.NT.animateCounter(mseEl, 0, Math.round(mse), 900, '', '', true);
                    } else {
                        mseEl.textContent = mse ? mse.toLocaleString('en-US', { maximumFractionDigits: 0 }) : '—';
                    }
                    if (window.NT && window.NT.animateDecimal && typeof r2 === 'number') {
                        window.NT.animateDecimal(r2El, 0, r2, 900, 4);
                    } else {
                        r2El.textContent = r2 !== undefined ? r2.toFixed(4) : '—';
                    }

                    // Flash de actualización
                    ['metric-mse', 'metric-r2'].forEach(id => {
                        const el = document.getElementById(id);
                        el.classList.add('updated');
                        setTimeout(() => el.classList.remove('updated'), 1500);
                    });

                    // Regenerar el Reporte en la Sección 5
                    generarReporte(mse, r2, coef, intercept);

                    document.getElementById('btn-ver-reporte').style.display = 'inline-block';
                }

                statusEl.textContent = '✅ Completado — ' + new Date().toLocaleTimeString();

            } catch (err) {
                try { window.AppState.pyodide.runPython('sys.stdout = sys.__stdout__'); }
                catch (_) { }
                consoleEl.className = 'pg-console error';
                consoleEl.textContent = '❌ Error:\n' + err.message;
                statusEl.textContent = '❌ Error al ejecutar';
                document.getElementById('metric-mse').classList.remove('updating');
                document.getElementById('metric-r2').classList.remove('updating');

            } finally {
                btnEl.disabled = false;
            }
        }
        // ---- RESTABLECER EL PLAYGROUND ----
        function resetPlayground() {
            const view = window.AppState.playgroundEditor;
            if (!view) return;

            // Restaurar código original
            view.dispatch({
                changes: { from: 0, to: view.state.doc.length, insert: CODIGO_PLAYGROUND }
            });

            // Limpiar UI
            document.getElementById('pg-console').className = 'pg-console';
            document.getElementById('pg-console').textContent = 'El output de print() aparecerá aquí.';
            document.getElementById('pg-status').textContent = 'Código restablecido.';
            document.getElementById('val-mse').textContent = '—';
            document.getElementById('val-r2').textContent = '—';
            document.getElementById('pg-plot').innerHTML =
                '<span class="pg-plot-placeholder">El gráfico aparecerá aquí después de ejecutar.</span>';
        }

        // ---- REPORTE DINÁMICO ----
        // Genera la interpretación condicional de MSE y R²
        function generarReporte(mse, r2, coef = null, intercept = null) {
            if (mse === undefined || r2 === undefined || mse === null || r2 === null || isNaN(mse) || isNaN(r2)) {
                return;
            }
            const emptyEl = document.getElementById('report-empty');
            const contentEl = document.getElementById('report-content');
            const metricsEl = document.getElementById('report-metrics');
            const interpEl = document.getElementById('report-interpretation');
            const stampEl = document.getElementById('report-timestamp');

            // ── Determinar veredicto de R² ──────────────────────────
            let r2Clase, r2Veredicto, r2Color;
            if (r2 >= 0.8) {
                r2Clase = 'verdict-good';
                r2Veredicto = 'Bueno';
                r2Color = 'var(--accent2)';
            } else if (r2 >= 0.4) {
                r2Clase = 'verdict-medium';
                r2Veredicto = 'Moderado';
                r2Color = '#d29922';
            } else {
                r2Clase = 'verdict-poor';
                r2Veredicto = 'Débil';
                r2Color = 'var(--accent3)';
            }

            // ── Determinar veredicto de MSE ─────────────────────────
            // El precio promedio del dataset es ~68,000.
            // Usamos RMSE (raíz del MSE) para compararlo con el precio promedio.
            const rmse = Math.sqrt(mse);
            const precioPromedio = 68000;
            const errorRelativo = (rmse / precioPromedio) * 100;

            let mseVeredicto, mseDescripcion;
            if (errorRelativo < 20) {
                mseVeredicto = 'Aceptable';
                mseDescripcion = 'El error promedio es menor al 20% del precio típico.';
            } else if (errorRelativo < 35) {
                mseVeredicto = 'Alto';
                mseDescripcion = 'El error promedio representa entre el 20% y 35% del precio típico.';
            } else {
                mseVeredicto = 'Muy alto';
                mseDescripcion = 'El error promedio supera el 35% del precio típico.';
            }

            // ── Generar interpretación en lenguaje natural ──────────
            let interpretacion;
            if (r2 >= 0.7) {
                interpretacion = `
      El modelo tiene un <strong>buen poder explicativo</strong>:
      el R² de <strong>${r2.toFixed(4)}</strong> indica que el tamaño del lote
      explica el <strong>${(r2 * 100).toFixed(1)}%</strong> de la variación
      en el precio de las casas del dataset.
      El error promedio de predicción (RMSE) es de
      <strong>$${rmse.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>,
      lo cual es ${mseVeredicto.toLowerCase()} para el rango de precios del dataset.`;
            } else if (r2 >= 0.4) {
                interpretacion = `
      El modelo tiene un <strong>poder predictivo moderado</strong>:
      el R² de <strong>${r2.toFixed(4)}</strong> indica que el tamaño del lote
      solo explica el <strong>${(r2 * 100).toFixed(1)}%</strong> de la variación
      en el precio. Esto sugiere que <strong>otras variables</strong> (número de
      habitaciones, baños, ubicación) tienen un impacto significativo que este
      modelo no captura. El RMSE de
      <strong>$${rmse.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
      confirma que las predicciones individuales pueden estar lejos del precio real.`;
            } else {
                interpretacion = `
      El modelo tiene un <strong>poder predictivo débil</strong>:
      el R² de <strong>${r2.toFixed(4)}</strong> indica que el tamaño del lote
      solo explica el <strong>${(r2 * 100).toFixed(1)}%</strong> de la variación
      en el precio. <strong>Usar solo lotsize como predictor no es suficiente</strong>
      para este dataset. Se recomienda incluir más variables o usar un modelo
      más complejo. El RMSE de
      <strong>$${rmse.toLocaleString('en-US', { maximumFractionDigits: 0 })}</strong>
      indica errores de predicción muy grandes.`;
            }

            // ── Renderizar métricas ─────────────────────────────────
            metricsEl.innerHTML = `
    <div class='report-metric-card'>
      <div class='rmc-label'>R² — Coeficiente de determinación</div>
      <div class='rmc-value' style='color:${r2Color}'>${r2.toFixed(4)}</div>
      <span class='rmc-verdict ${r2Clase}'>${r2Veredicto}</span>
    </div>
    <div class='report-metric-card'>
      <div class='rmc-label'>MSE — Error Cuadrático Medio</div>
      <div class='rmc-value' style='color:var(--accent)'>
        ${mse.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </div>
      <span class='rmc-verdict verdict-medium'>${mseVeredicto}</span>
    </div>
    <div class='report-metric-card'>
      <div class='rmc-label'>RMSE — Raíz del Error Cuadrático Medio</div>
      <div class='rmc-value' style='color:var(--accent)'>
        $${rmse.toLocaleString('en-US', { maximumFractionDigits: 0 })}
      </div>
      <span class='rmc-verdict verdict-medium'>En dólares</span>
    </div>
    <div class='report-metric-card'>
      <div class='rmc-label'>Error relativo</div>
      <div class='rmc-value' style='color:var(--accent)'>
        ${errorRelativo.toFixed(1)}%
      </div>
      <span class='rmc-verdict ${errorRelativo < 20 ? "verdict-good" : errorRelativo < 35 ? "verdict-medium" : "verdict-poor"}'>${mseVeredicto}</span>
    </div>`,

                // ── Renderizar interpretación ───────────────────────────
                interpEl.innerHTML = interpretacion;
            if (coef !== null && intercept !== null) {
                interpEl.innerHTML += `
    <br><br><strong>Ecuación del modelo:</strong><br>
    <code>price = ${coef.toFixed(4)} × lotsize + ${intercept.toFixed(2)}</code><br>
    <small>Por cada pie² adicional de lote, el precio sube $${coef.toFixed(2)}.</small>
  `;
            }


            // ── Timestamp ───────────────────────────────────────────
            stampEl.textContent =
                `Reporte generado el ${new Date().toLocaleDateString('es-ES')}
     a las ${new Date().toLocaleTimeString('es-ES')}`,

                // ── Mostrar el reporte (ocultar estado vacío) ───────────
                emptyEl.style.display = 'none';
            contentEl.classList.add('visible');

        }
        // ---- COORDINADOR DEL PLAYGROUND ----
        let _pgInicializado = false;

        // Esta función se llama desde la lógica de navegación
        // cuando el usuario hace clic en la pestaña 04
        function initSeccion4() {
            if (_pgInicializado) return; // solo crear el editor una vez
            if (!window.AppState.pyodideReady) return;
            if (!window.CMModules) return;
            initPlayground();
            _pgInicializado = true;
        }
        // Función JavaScript:
        function irAReporte() {
            // Simular clic en la pestaña 05
            document.querySelector('[data-section="s5"]').click();
        }


/* ===================================================================
   NEURAL TERMINAL — capa de presentación
   Cursor, reveal, contadores, typewriter, modo presentación, etc.
   Toda esta capa es independiente de la lógica de Pyodide.
   =================================================================== */
(function () {
    'use strict';

    // Bandera global para que el resto del código (runBlock, runPlayground)
    // pueda llamar a helpers de animación.
    const NT = window.NT = {};

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* ---------- 1. Cursor personalizado ---------- */
    function initCursor() {
        if (reduceMotion || !isFinePointer) return;
        const cursor = document.getElementById('cursor');
        const ring = document.getElementById('cursor-ring');
        if (!cursor || !ring) return;

        let mx = window.innerWidth / 2, my = window.innerHeight / 2;
        let rx = mx, ry = my;

        function onMove(e) {
            mx = e.clientX;
            my = e.clientY;
            cursor.style.left = mx + 'px';
            cursor.style.top = my + 'px';
            if (!document.body.classList.contains('cursor-loaded')) {
                document.body.classList.add('cursor-loaded');
            }
        }
        document.addEventListener('mousemove', onMove, { passive: true });

        // Ring con lag suave (~60ms perceptual via lerp por frame)
        function loop() {
            rx += (mx - rx) * 0.18;
            ry += (my - ry) * 0.18;
            ring.style.left = rx + 'px';
            ring.style.top = ry + 'px';
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);

        // Ocultar cursor cuando sale de la ventana
        document.addEventListener('mouseleave', () => {
            cursor.style.opacity = '0';
            ring.style.opacity = '0';
        });
        document.addEventListener('mouseenter', () => {
            cursor.style.opacity = '';
            ring.style.opacity = '';
        });
    }

    /* ---------- 2. Color de cursor según sección activa ---------- */
    function applyCursorForSection(sectionId) {
        const sec = document.getElementById(sectionId);
        if (!sec) return;
        const mode = sec.dataset.cursor || 'default';
        document.body.classList.remove('cursor-code', 'cursor-play', 'cursor-data');
        if (mode === 'code') document.body.classList.add('cursor-code');
        else if (mode === 'play') document.body.classList.add('cursor-play');
        else if (mode === 'data') document.body.classList.add('cursor-data');
    }

    /* ---------- 3. Reveal observer con stagger ---------- */
    const revealObserver = ('IntersectionObserver' in window) && !reduceMotion
        ? new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
        : null;

    function observeReveals(root = document) {
        const els = root.querySelectorAll('.reveal:not(.visible)');
        if (!revealObserver) {
            // Sin IO o reduced motion: mostrar todo
            els.forEach(el => el.classList.add('visible'));
            return;
        }
        els.forEach((el, i) => {
            if (!el.style.getPropertyValue('--i')) {
                el.style.setProperty('--i', i % 6);
            }
            revealObserver.observe(el);
        });
    }
    NT.observeReveals = observeReveals;

    // Cuando una nueva sección entra a `.active`, re-disparamos reveals dentro de ella.
    // El IntersectionObserver puede no haber detectado los elementos si estaban en
    // un contenedor con display:none.
    function forceRevealsInSection(sectionId) {
        const sec = document.getElementById(sectionId);
        if (!sec) return;
        if (reduceMotion) {
            sec.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
            return;
        }
        // Reset y re-observe para que se animen al entrar a la sección
        sec.querySelectorAll('.reveal').forEach((el, i) => {
            el.classList.remove('visible');
            el.style.setProperty('--i', i % 6);
        });
        requestAnimationFrame(() => {
            sec.querySelectorAll('.reveal').forEach((el, i) => {
                // En vez de re-observar (que podría no detectar elementos ya en viewport),
                // forzamos un microdelay según el índice y aplicamos visible.
                setTimeout(() => el.classList.add('visible'), 50 + (i % 6) * 80);
            });
        });
    }

    /* ---------- 4. Contadores animados ---------- */
    function animateCounter(el, from, to, duration = 1200, prefix = '', suffix = '', isCurrency = false) {
        if (reduceMotion) {
            el.textContent = (prefix || '') + (isCurrency
                ? '$' + Math.round(to).toLocaleString('en-US')
                : Math.round(to).toLocaleString('en-US')) + (suffix || '');
            return;
        }
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 4); // easeOutQuart
            const v = from + (to - from) * ease;
            el.textContent = (prefix || '')
                + (isCurrency ? '$' + Math.round(v).toLocaleString('en-US')
                    : Math.round(v).toLocaleString('en-US'))
                + (suffix || '');
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    NT.animateCounter = animateCounter;

    function animateDecimal(el, from, to, duration = 900, digits = 4) {
        if (reduceMotion) { el.textContent = to.toFixed(digits); return; }
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            const v = from + (to - from) * ease;
            el.textContent = v.toFixed(digits);
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    NT.animateDecimal = animateDecimal;

    // Disparar contadores cuando el elemento entra al viewport
    const counterObserver = !reduceMotion && ('IntersectionObserver' in window)
        ? new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseFloat(el.dataset.target);
                    const prefix = el.dataset.prefix || '';
                    const suffix = el.dataset.suffix || '';
                    const currency = el.dataset.currency === 'true';
                    animateCounter(el, 0, target, 1300, prefix, suffix, currency);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 })
        : null;

    function observeCounters(root = document) {
        const els = root.querySelectorAll('[data-counter]:not([data-counter-fired])');
        els.forEach(el => {
            el.dataset.counterFired = 'true';
            if (!counterObserver) {
                const t = parseFloat(el.dataset.target);
                const p = el.dataset.prefix || '';
                const s = el.dataset.suffix || '';
                el.textContent = p + Math.round(t).toLocaleString('en-US') + s;
                return;
            }
            counterObserver.observe(el);
        });
    }
    NT.observeCounters = observeCounters;

    /* ---------- 5. Typewriter ---------- */
    function typeWriter(el, text, speed = 60) {
        if (!el) return;
        if (reduceMotion) { el.textContent = text; return; }
        el.textContent = '';
        let i = 0;
        (function step() {
            if (i < text.length) {
                el.textContent += text[i++];
                setTimeout(step, speed);
            }
        })();
    }
    NT.typeWriter = typeWriter;

    /* ---------- 6. Modo presentación ---------- */
    function togglePresenter() {
        document.body.classList.toggle('presenter-mode');
    }
    function initPresenter() {
        const btn = document.getElementById('btn-presenter');
        if (btn) btn.addEventListener('click', togglePresenter);
        document.addEventListener('keydown', (e) => {
            // Solo F/f, sin modificadores, sin focus en un input/textarea/cm-editor
            if (e.key !== 'f' && e.key !== 'F') return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const t = e.target;
            if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
            // Evitar conflicto si el foco está en el editor CodeMirror
            if (t && t.closest && t.closest('.cm-editor')) return;
            e.preventDefault();
            togglePresenter();
        });
    }

    /* ---------- 7. Barra de progreso de bloques (S03) ---------- */
    const _blocksDone = new Set();
    function markBlockDone(id) {
        _blocksDone.add(String(id));
        const fill = document.getElementById('blocks-progress-fill');
        if (!fill) return;
        const total = 6; // BLOQUES 1..6
        const pct = Math.min((_blocksDone.size / total) * 100, 100);
        fill.style.width = pct + '%';
    }
    NT.markBlockDone = markBlockDone;

    /* ---------- 8. Mensajes del loader rotativos ---------- */
    const _loaderMessages = [
        'Cargando Pyodide...',
        'Iniciando entorno Python...',
        'Cargando pandas y numpy...',
        'Importando scikit-learn...',
        'Cargando matplotlib...',
        'Preparando dataset Housing...',
        '¡Listo para explorar!'
    ];
    function dressLoaderStep() {
        // Sobrescribir el elemento si el texto cambió a uno nuestro
        // No interfiere con setLoaderStep() porque eso ya define el texto exacto.
    }

    /* ---------- 9. Generar stat cards animados del dataset ---------- */
    // Esto reemplaza al renderStats() existente: usa la misma estructura HTML
    // pero con data-counter para que los valores se animen al entrar.
    function patchStatsGrid() {
        const original = window.renderStats;
        if (typeof original !== 'function') return;
        window.renderStats = function (rows) {
            const prices = rows.map(r => parseInt(r.price));
            const lots = rows.map(r => parseInt(r.lotsize));
            const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

            const stats = [
                { label: 'Total de casas', target: rows.length, sub: 'registros en el dataset' },
                { label: 'Precio mínimo', target: Math.min(...prices), sub: 'casa más barata', currency: true },
                { label: 'Precio máximo', target: Math.max(...prices), sub: 'casa más cara', currency: true },
                { label: 'Precio promedio', target: avg, sub: 'media del dataset', currency: true },
                { label: 'Lotsize mínimo', target: Math.min(...lots), sub: 'lote más pequeño', suffix: ' ft²' },
                { label: 'Lotsize máximo', target: Math.max(...lots), sub: 'lote más grande', suffix: ' ft²' },
                { label: 'Columnas', target: Object.keys(rows[0]).length, sub: 'variables por casa' }
            ];

            const grid = document.getElementById('stats-grid');
            grid.innerHTML = stats.map((s, i) => `
                <div class="stat-card reveal" style="--i:${i}">
                    <div class="stat-label">${s.label}</div>
                    <div class="stat-value"
                         data-counter
                         data-target="${s.target}"
                         ${s.currency ? 'data-currency="true"' : ''}
                         ${s.prefix ? `data-prefix="${s.prefix}"` : ''}
                         ${s.suffix ? `data-suffix="${s.suffix}"` : ''}>0</div>
                    <div class="stat-sub">${s.sub}</div>
                </div>
            `).join('');

            // Activar contadores y reveals que recién agregamos
            observeReveals(grid);
            observeCounters(grid);
        };
    }

    /* ---------- 10. Hook al pyodide-loader: ocultar y soltar el bloqueo del cursor ---------- */
    // (nada por hacer aquí más allá del CSS — el loader se oculta solo)

    /* ---------- Theme toggle (claro / oscuro) ---------- */
    function getInitialTheme() {
        const saved = localStorage.getItem('nt-theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
    function applyTheme(theme) {
        if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
        else document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('nt-theme', theme);
    }
    function initTheme() {
        applyTheme(getInitialTheme());
        const btn = document.getElementById('btn-theme');
        if (btn) btn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            applyTheme(cur === 'light' ? 'dark' : 'light');
        });
    }

    /* ---------- 11. Bootstrap ---------- */
    function init() {
        initTheme();
        initCursor();
        initPresenter();
        observeReveals();
        observeCounters();
        patchStatsGrid();

        // Cursor por sección inicial
        const activeSection = document.querySelector('.section.active');
        if (activeSection) applyCursorForSection(activeSection.id);

        // Typewriter en el hero de S01 (al cargar la página)
        const typed = document.getElementById('s1-typed');
        if (typed) {
            const text = typed.textContent;
            // Pequeño delay para que se sienta como "booteo"
            setTimeout(() => typeWriter(typed, text, 55), 350);
        }
    }

    // Reaccionar a cambios de sección (disparado desde el handler de tabs)
    window.addEventListener('section-changed', (e) => {
        const id = e.detail.id;
        applyCursorForSection(id);
        forceRevealsInSection(id);
        // Repetir typewriter si volvemos a S01
        if (id === 's1') {
            const t = document.getElementById('s1-typed');
            if (t) {
                const text = t.dataset.original || t.textContent || 'Machine Learning?';
                t.dataset.original = text;
                typeWriter(t, text, 55);
            }
        }
        // Scroll al inicio de la sección
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    // Iniciar tan pronto el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
