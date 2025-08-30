package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"os/exec"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	exec.Command("docker-compose", "up", "postgres", "-d").Run()

	// Load .env file
	err := godotenv.Load("../.env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	pgUser := os.Getenv("PG_USERNAME")
	pgPassword := os.Getenv("PG_PASSWORD")
	pgHost := os.Getenv("PG_HOST")
	pgPort := os.Getenv("PG_PORT")
	pgDatabase := os.Getenv("PG_DATABASE")

	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", pgUser, pgPassword, pgHost, pgPort, pgDatabase)

	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	err = db.Ping()
	if err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	fmt.Println("Successfully connected to the database")

	db.Query("TRUNCATE TABLE payments;")

}
