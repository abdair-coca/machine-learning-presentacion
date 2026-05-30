import type { LessonSpec } from '../types/lesson';

/**
 * Lección: Regresión Lineal Múltiple con Housing.csv.
 * Extiende la regresión lineal simple usando múltiples variables
 * para mejorar las predicciones del precio de casas.
 */
export const MultipleLinearRegressionLesson: LessonSpec = {
  slug: 'multiple-linear-regression',
  title: 'Regresión Lineal Múltiple',
  subtitle:
    'Predice el precio de una casa usando múltiples características como tamaño, baños, habitaciones y garaje.',
  icon: '📊',
  accent: 'violet',
  difficulty: 'intermedio',

  dataset: {
    path: '/datasets/Housing.csv',
    targetCol: 'price',
    featureCols: ['lotsize', 'bedrooms', 'bathrms', 'stories', 'garagepl'],
    meanTarget: 68000,
  },

  concepts: [
    {
      icon: '🧠',
      title: 'Múltiples variables',
      body: 'Ahora el modelo aprende usando varias características al mismo tiempo. Cada feature aporta información distinta sobre el precio.',
      accent: 'violet',
    },
    {
      icon: '📈',
      title: 'Hiperplano',
      body: 'La ecuación ya no es una línea: el modelo crea un hiperplano multidimensional que relaciona varias variables con el precio.',
      accent: 'teal',
    },
    {
      icon: '⚖️',
      title: 'Coeficientes independientes',
      body: 'Cada variable tiene su propio coeficiente. El modelo aprende cuánto influye cada feature manteniendo las demás constantes.',
      accent: 'amber',
    },
    {
      icon: '📐',
      title: 'Generalización',
      body: 'Más variables suelen mejorar las predicciones, pero también aumentan el riesgo de overfitting si agregamos ruido innecesario.',
      accent: 'coral',
    },
    {
      icon: '🧮',
      title: 'MSE y R²',
      body: 'Seguimos usando MSE y R² para medir el desempeño. En regresión múltiple normalmente obtenemos un R² más alto.',
      accent: 'violet',
    },
    {
      icon: '⚡',
      title: 'scikit-learn',
      body: 'LinearRegression() resuelve automáticamente todos los coeficientes usando álgebra matricial y mínimos cuadrados.',
      accent: 'teal',
    },
  ],

  datasetView: {
    visibleColumns: [
      'rownames',
      'price',
      'lotsize',
      'bedrooms',
      'bathrms',
      'stories',
      'garagepl',
    ],
    filters: [
      {
        column: 'price',
        type: 'range',
        label: 'Precio ($)',
        min: 0,
        max: 200000,
        step: 1000,
      },
      {
        column: 'lotsize',
        type: 'range',
        label: 'Lotsize (ft²)',
        min: 0,
        max: 20000,
        step: 100,
      },
      {
        column: 'bathrms',
        type: 'range',
        label: 'Baños',
        min: 1,
        max: 10,
        step: 1,
      },
    ],
    plots: [],
    pageSize: 10,
  },

  codeSteps: [
    {
      id: '1',
      title: 'Importar librerías',
      explanationMd:
        'Usamos `pandas` para cargar el dataset, `scikit-learn` para entrenar el modelo y métricas para evaluar qué tan bien predice.',
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
      title: 'Seleccionar múltiples features',
      explanationMd:
        'Ahora usamos varias columnas como entrada del modelo. Cada fila tendrá múltiples valores que describen la casa.',
      code: `data = pd.read_csv('/Housing.csv')

features = ['lotsize', 'bedrooms', 'bathrms', 'stories', 'garagepl']

X = data[features]
y = data['price']

print('Dataset cargado:', data.shape)
print()
print('Features seleccionadas:')
print(features)
print()
print(X.head(8).to_string())`,
    },

    {
      id: '3',
      title: 'Explorar correlaciones',
      explanationMd:
        'La matriz de correlación muestra qué variables tienen mayor relación con el precio. Valores cercanos a 1 indican relación positiva fuerte.',
      expectsPlot: true,
      code: `corr = data[['price', 'lotsize', 'bedrooms',
             'bathrms', 'stories', 'garagepl']].corr()

fig, ax = plt.subplots(figsize=(6, 5))
fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')

im = ax.imshow(corr, cmap='viridis')

ax.set_xticks(range(len(corr.columns)))
ax.set_yticks(range(len(corr.columns)))

ax.set_xticklabels(corr.columns, rotation=45, ha='right', color='#e6edf3')
ax.set_yticklabels(corr.columns, color='#e6edf3')

for i in range(len(corr.columns)):
    for j in range(len(corr.columns)):
        ax.text(
            j, i,
            f'{corr.iloc[i, j]:.2f}',
            ha='center',
            va='center',
            color='white',
            fontsize=8
        )

ax.set_title('Matriz de correlación', color='#e6edf3', pad=12)

buf = io.BytesIO()
plt.savefig(
    buf,
    format='png',
    dpi=110,
    bbox_inches='tight',
    facecolor=fig.get_facecolor()
)

plt.close()
buf.seek(0)

__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')

print('Mapa de correlaciones generado.')`,
    },

    {
      id: '4',
      title: 'Dividir y entrenar',
      explanationMd:
        'Entrenamos el modelo usando múltiples variables simultáneamente. `LinearRegression()` ajusta todos los coeficientes al mismo tiempo.',
      code: `X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model = LinearRegression()

model.fit(X_train, y_train)

print(f'Entrenamiento: {len(X_train)} muestras')
print(f'Prueba:        {len(X_test)} muestras')
print()

print('Coeficientes aprendidos:')
for feature, coef in zip(features, model.coef_):
    print(f'  {feature:<10}: {coef:>10.2f}')

print()
print(f'Intercepto: {model.intercept_:.2f}')`,
    },

    {
      id: '5',
      title: 'Evaluar el modelo',
      explanationMd:
        'Comparamos las predicciones con los valores reales para medir el desempeño del modelo usando MSE, RMSE y R².',
      code: `y_pred = model.predict(X_test)

mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

print(f'MSE : {mse:,.2f}')
print(f'RMSE: {rmse:,.2f}')
print(f'R²  : {r2:.4f}')

import js

js.window.publishResults({
    'mse': float(mse),
    'rmse': float(rmse),
    'r2': float(r2),
})`,
    },

    {
      id: '6',
      title: 'Interpretar los coeficientes',
      explanationMd:
        'Cada coeficiente representa cuánto cambia el precio cuando esa variable aumenta una unidad, manteniendo las demás constantes.',
      code: `print('Interpretación del modelo:')
print()

for feature, coef in zip(features, model.coef_):

    direction = 'sube' if coef > 0 else 'baja'

    print(
        f'Si {feature} aumenta 1 unidad, '
        f'el precio {direction} aproximadamente '
        f'{abs(coef):,.2f} dólares.'
    )

print()
print('Ecuación aproximada:')
print()

equation = f'price = {model.intercept_:.2f}'

for feature, coef in zip(features, model.coef_):
    equation += f' + ({coef:.2f} × {feature})'

print(equation)`,
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

# Cargar dataset
data = pd.read_csv('/Housing.csv')

# Features del modelo
features = [
    'lotsize',
    'bedrooms',
    'bathrms',
    'stories',
    'garagepl'
]

X = data[features]
y = data['price']

# Split
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

# Modelo
model = LinearRegression()
model.fit(X_train, y_train)

# Predicciones
y_pred = model.predict(X_test)

# Métricas
mse = mean_squared_error(y_test, y_pred)
rmse = mse ** 0.5
r2 = r2_score(y_test, y_pred)

print(f'MSE : {mse:,.2f}')
print(f'RMSE: {rmse:,.2f}')
print(f'R²  : {r2:.4f}')

print()
print('Coeficientes:')
for feature, coef in zip(features, model.coef_):
    print(f'{feature:<10}: {coef:>10.2f}')

# Scatter plot reales vs predicciones
fig, ax = plt.subplots(figsize=(5, 4))

fig.patch.set_facecolor('#161b22')
ax.set_facecolor('#161b22')

ax.scatter(
    y_test,
    y_pred,
    alpha=0.6,
    color='#9D7FFF',
    s=22
)

x_line = [y_test.min(), y_test.max()]

ax.plot(
    x_line,
    x_line,
    color='#1DC98A',
    linewidth=1.5,
    linestyle='--'
)

ax.set_xlabel(
    'Valores reales',
    color='#8b949e',
    fontsize=9
)

ax.set_ylabel(
    'Predicciones',
    color='#8b949e',
    fontsize=9
)

ax.set_title(
    'Regresión múltiple: reales vs predicciones',
    color='#e6edf3',
    fontsize=11,
    pad=8
)

ax.tick_params(colors='#8b949e', labelsize=8)

for spine in ax.spines.values():
    spine.set_edgecolor('#30363d')

ax.grid(
    True,
    color='#30363d',
    linewidth=0.4,
    linestyle='--'
)

buf = io.BytesIO()

plt.savefig(
    buf,
    format='png',
    dpi=110,
    bbox_inches='tight',
    facecolor=fig.get_facecolor()
)

plt.close()

buf.seek(0)

__plot_b64__ = base64.b64encode(buf.read()).decode('utf-8')

# Publicar métricas
js.window.publishResults({
    'mse': float(mse),
    'rmse': float(rmse),
    'r2': float(r2),
    'intercept': float(model.intercept_),
    'coef_lotsize': float(model.coef_[0]),
    'coef_bedrooms': float(model.coef_[1]),
    'coef_bathrms': float(model.coef_[2]),
    'coef_stories': float(model.coef_[3]),
    'coef_garagepl': float(model.coef_[4]),
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
        { if: 'gte', value: 0.85, label: 'Excelente', tone: 'good' },
        { if: 'gte', value: 0.60, label: 'Bueno', tone: 'medium' },
        { if: 'lte', value: 0.60, label: 'Mejorable', tone: 'poor' },
      ],
    },
  ],

  conclusionsMd: `### ¿Qué aprendimos?

La regresión lineal múltiple mejora significativamente las predicciones porque el modelo ya no depende de una sola variable. Ahora puede combinar información de tamaño, baños, habitaciones y garaje para capturar patrones más complejos.

### ¿Por qué mejora el R²?

Cada feature aporta información distinta:

- \`lotsize\` aporta el tamaño del terreno.
- \`bathrms\` suele tener una relación fuerte con el precio.
- \`stories\` y \`garagepl\` ayudan a capturar nivel económico y comodidad.

Al combinar todas estas variables, el modelo explica una mayor parte de la variación del precio.

### Limitaciones

Aunque el modelo mejora, sigue siendo lineal. Eso significa que:

- Asume relaciones lineales entre variables y precio.
- No captura interacciones complejas.
- Puede verse afectado por outliers.

### Próximos pasos naturales

- **Feature engineering**: crear nuevas variables derivadas.
- **Regularización**: probar Ridge o Lasso.
- **Modelos no lineales**: Decision Trees o Random Forest.
- **Escalado de datos**: normalizar features para modelos más avanzados.

### Lo importante del pipeline

El flujo sigue siendo el mismo:

\`importar → cargar → seleccionar features → split → entrenar → evaluar\`

Ese pipeline es la base de casi todo machine learning clásico.`
};