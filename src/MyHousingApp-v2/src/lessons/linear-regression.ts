import type { LessonSpec } from '../types/lesson';

/**
 * Lección: Regresión Lineal con Housing.csv.
 * Equivalente al vanilla MyHousingApp/main.js — los strings Python son los mismos
 * (BLOQUES en main.js:927-988 + CODIGO_PLAYGROUND en main.js:1152-1208).
 */
export const linearRegressionLesson: LessonSpec = {
  slug: 'linear-regression',
  title: 'Regresión Lineal',
  subtitle:
    'Predice el precio de una casa a partir del tamaño del lote. El "hola mundo" del machine learning.',
  icon: '📈',
  accent: 'teal',
  difficulty: 'intro',

  dataset: {
    path: '/datasets/Housing.csv',
    targetCol: 'price',
    featureCols: ['lotsize'],
    meanTarget: 68000,
  },

  concepts: [
    {
      icon: '🎯',
      title: 'Aprendizaje supervisado',
      body: 'Entrenamos el modelo con ejemplos etiquetados (filas con precio conocido) para predecir el precio de casas nuevas.',
      accent: 'teal',
    },
    {
      icon: '📏',
      title: 'Una línea, dos parámetros',
      body: 'El modelo busca la recta y = a·x + b que minimiza el error cuadrático entre predicciones y valores reales.',
      accent: 'violet',
    },
    {
      icon: '📐',
      title: 'Train / Test split',
      body: 'Dividimos el dataset: 80% para entrenar, 20% para evaluar honestamente cómo predice en datos que nunca vio.',
      accent: 'amber',
    },
    {
      icon: '🧮',
      title: 'MSE y R²',
      body: 'MSE mide cuánto se equivoca en promedio (al cuadrado). R² indica qué porcentaje de la varianza captura: 1.0 es perfecto, 0 inútil.',
      accent: 'coral',
    },
    {
      icon: '⚡',
      title: 'scikit-learn',
      body: 'LinearRegression() resuelve el ajuste con álgebra lineal en milisegundos. No hay magia: es la fórmula de mínimos cuadrados.',
      accent: 'teal',
    },
    {
      icon: '🧠',
      title: 'Una sola variable',
      body: 'Usamos solo lotsize como predictor. En la realidad incluirías baños, habitaciones, ubicación… la idea se generaliza.',
      accent: 'violet',
    },
  ],

  datasetView: {
    visibleColumns: ['rownames', 'price', 'lotsize', 'bedrooms', 'bathrms', 'stories', 'garagepl'],
    filters: [
      { column: 'price', type: 'range', label: 'Precio ($)', min: 0, max: 200000, step: 1000 },
      { column: 'lotsize', type: 'range', label: 'Lotsize (ft²)', min: 0, max: 20000, step: 100 },
    ],
    plots: [],
    pageSize: 10,
  },

  codeSteps: [
    {
      id: '1',
      title: 'Importar librerías',
      explanationMd:
        'Cargamos `pandas` para manipular el CSV, `scikit-learn` para el modelo y métricas, y `matplotlib` para graficar. `matplotlib.use("Agg")` activa el backend sin ventana (necesario en el navegador).',
      code: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
print('Librerías importadas correctamente.')`,
    },
    {
      id: '2',
      title: 'Cargar y explorar el dataset',
      explanationMd:
        'Leemos el CSV directamente desde el filesystem virtual de Pyodide. `X` es la feature (`lotsize`) e `y` la variable objetivo (`price`).',
      code: `data = pd.read_csv('/Housing.csv')
X = data['lotsize']
y = data['price']
print('Dataset cargado:', data.shape)
print(data[['price','lotsize','bedrooms']].head(8).to_string())`,
    },
    {
      id: '3',
      title: 'Visualizar la relación',
      explanationMd:
        'Un scatter plot revela si la relación entre `lotsize` y `price` parece lineal. Si los puntos se acercan a una línea recta, la regresión lineal será buena candidata.',
      expectsPlot: true,
      code: `fig, ax = plt.subplots(figsize=(7, 4))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')
ax.scatter(X, y, alpha=0.5, color='#1DC98A', s=18, linewidths=0)
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
__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')
print('Gráfico generado.')`,
    },
    {
      id: '4',
      title: 'Dividir y entrenar',
      explanationMd:
        '`train_test_split` separa 80% / 20%. `random_state=42` hace el corte reproducible. `model.fit()` ajusta los parámetros `a` (pendiente) y `b` (intercepto).',
      code: `X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)
model = LinearRegression()
model.fit(X_train.values.reshape(-1, 1), y_train)
print(f'Entrenamiento: {len(X_train)} muestras')
print(f'Prueba:        {len(X_test)} muestras')
print(f'Pendiente (a): {model.coef_[0]:.4f}')
print(f'Intercepto (b): {model.intercept_:.2f}')`,
    },
    {
      id: '5',
      title: 'Evaluar el modelo',
      explanationMd:
        'Predecimos sobre `X_test` (datos que el modelo nunca vio) y comparamos con `y_test`. **MSE** y **R²** son las métricas estándar para regresión.',
      code: `y_pred = model.predict(X_test.values.reshape(-1, 1))
mse = mean_squared_error(y_test, y_pred)
r2  = r2_score(y_test, y_pred)
print(f'MSE : {mse:,.2f}')
print(f'RMSE: {mse**0.5:,.2f}  (raíz del MSE, en dólares)')
print(f'R²  : {r2:.4f}')

# Publicar métricas al UI para la sección 5 (Reporte)
import js
js.window.publishResults({
    'mse': float(mse),
    'r2': float(r2),
    'rmse': float(mse**0.5),
})`,
    },
    {
      id: '6',
      title: 'Interpretar el modelo',
      explanationMd:
        'El coeficiente nos dice cuánto sube `price` por cada `lotsize` extra. El intercepto es el valor estimado cuando `lotsize = 0` (no siempre tiene sentido físico, pero ancla la recta).',
      code: `a = model.coef_[0]
b = model.intercept_
print(f'Ecuación del modelo:')
print(f'  price = {a:.4f} × lotsize + {b:.2f}')
print()
print(f'Interpretación:')
print(f'  Por cada pie² adicional de lote, el precio sube {a:.2f}')`,
    },
  ],

  playgroundCode: `import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import io, base64
import js

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
ax.scatter(y_test, y_pred, alpha=0.6, color='#1DC98A', s=20)
x_line = [y_test.min(), y_test.max()]
ax.plot(x_line, x_line, color='#9D7FFF', linewidth=1.5, linestyle='--')
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

# Publicar métricas al UI (sección Reporte)
js.window.publishResults({
    'mse': float(mse),
    'r2': float(r2),
    'rmse': float(mse**0.5),
    'coef': float(model.coef_[0]),
    'intercept': float(model.intercept_),
})`,

  metrics: [
    {
      key: 'mse',
      label: 'MSE — Error cuadrático medio',
      format: 'number',
      decimals: 0,
      source: 'global',
    },
    {
      key: 'rmse',
      label: 'RMSE — Raíz del MSE',
      format: 'currency',
      decimals: 0,
      source: 'global',
    },
    {
      key: 'r2',
      label: 'R² — Coeficiente de determinación',
      format: 'decimal',
      decimals: 4,
      source: 'global',
      verdict: [
        { if: 'gte', value: 0.8, label: 'Bueno', tone: 'good' },
        { if: 'gte', value: 0.4, label: 'Moderado', tone: 'medium' },
        { if: 'lte', value: 0.4, label: 'Débil', tone: 'poor' },
      ],
    },
  ],

  conclusionsMd: `### ¿Qué aprendimos?

La regresión lineal con **una sola variable** (lotsize) explica una parte de la variación en el precio, pero **no es suficiente** para predicciones precisas. El R² moderado nos dice que otras variables (habitaciones, baños, garage, ubicación) juegan un papel importante.

### Próximos pasos naturales

- **Regresión múltiple**: agregar más features (\`bedrooms\`, \`bathrms\`, \`stories\`, \`airco\`).
- **Feature engineering**: transformar \`lotsize\` con log para suavizar outliers.
- **Otros modelos**: probar Ridge, Lasso, o un Random Forest para capturar relaciones no lineales.

### Lo importante del pipeline

El esqueleto **importar → cargar → split → entrenar → evaluar** se repite en casi todos los métodos de machine learning. Aprenderlo aquí te ahorra tiempo en las siguientes lecciones.`,
};
