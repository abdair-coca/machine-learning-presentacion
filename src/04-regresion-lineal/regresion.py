# Importar librerias
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import matplotlib.pyplot as plt


# Cargar  datos
data = pd.read_csv('/Housing.csv')
X = data['lotsize']
y = data['price']
print(data)


data.shape


# Gráfico de dispersión
plt.scatter(X, y)
plt.xlabel('lotsize')
plt.ylabel('price')
plt.title("Gráfico de dispersión: lotsize vs. price")
plt.show()


# Dividir los datos
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
# Crear y entrenar el modelo
model = LinearRegression()
model.fit(X_train.values.reshape(-1, 1), y_train)


# Predicción
y_pred = model.predict(X_test.values.reshape(-1, 1))


# Evaluar el modelo
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print('Error Cuadrático Medio (MSE):', mse)
print('R-cuadrado (R2):', r2)


# Gráfica de dispersión
plt.scatter(y_test, y_pred)
plt.xlabel("Valores reales")
plt.ylabel("Predicciones")
plt.title("Valores reales vs. Predicciones")
# Línea de regresión (opcional)
x_min = min(y_test)
x_max = max(y_test)
x_line = [x_min, x_max]
y_line = [x_min, x_max]
plt.plot(x_line, y_line, color='red', linestyle='-')
plt.show()