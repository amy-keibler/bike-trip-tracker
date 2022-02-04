build-scss:
	grass sass/style.scss > static/style.css

generate-secret:
  openssl rand -base64 32

generate-certs:
  mkdir -p certs
  openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out certs/cert.pem -keyout certs/key.pem
