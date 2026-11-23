FROM python:3.12-alpine

WORKDIR /app

COPY simulador.py .

RUN sed -i 's/127\.0\.0\.1/0.0.0.0/g' simulador.py

CMD ["python", "-B", "-u", "simulador.py"]