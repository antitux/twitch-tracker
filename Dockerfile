FROM python:3.11-slim

WORKDIR /app

# Install dependencies first (better layer caching)
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py ./

# Copy templates and static files
COPY templates/ ./templates/
COPY static/ ./static/

EXPOSE 5000

ENV PARENT_DOMAIN=localhost

# Use exec form for better signal handling
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "app:app"]