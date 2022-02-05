build-scss:
	grass sass/style.scss > static/style.css

generate-secret:
  openssl rand -base64 32

generate-certs:
  mkdir -p certs
  openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out certs/cert.pem -keyout certs/key.pem

start-db:
  docker run --rm --name bike-trip-tracker-postgres -p 5432:5432 -e POSTGRES_PASSWORD=$POSTGRES_PASSWORD -d postgres:14.1

install-required-tools:
  cargo install grass --force
  cargo install sqlx-cli --force --no-default-features --features rustls,postgres