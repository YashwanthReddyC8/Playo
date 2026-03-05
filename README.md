# Backend Setup

## Pre-Setup Requirements

- **Install and set up** [Docker](https://docs.docker.com/desktop/).
- **Set up necessary environment variables** for the services to connect to the databases and other dependencies (you can use a `.env` file in the `services` directory to store these variables). Use the `.env.demo` file as a template.

## Running the Services

1. Open a terminal and navigate to the `services` directory.
2. Run the following command to start the services:

   ```bash
   docker compose up --build
   ```
3. To automatically rebuild the images when changes are detected:
    - you can use the `--watch` flag:
   ```bash
   docker compose up --build --watch
   ```
   - Or, you can use (in new terminal):
    ```bash
    docker compose watch
    ```
3. The services will be available at the following Ports:
   - API Gateway: `8040`
   - Eureka: `8761`
   - PostgreSQL: `5432`
   - Redis: `6379`
4. To stop the services, press `Ctrl + C` in the terminal.
5. To remove the containers, networks, and volumes created by Docker Compose, run the following command:
   ```bash
    docker compose down
    ```

## Notes

- Ensure that the ports mentioned above are not being used by other applications on your machine.
- The first time you run the services, Docker will build the images, which may take a few minutes. Subsequent runs will be faster as the images will be cached.
    * If you make changes to the code and want to rebuild the images, use the `--build` flag as shown in the command above.
    * If you want to run the services in detached mode (in the background), you can add the `-d` flag:
      ```bash
      docker compose up --build -d
      ```
    * To rebuild the images without using the cache, you can use the `--no-cache` flag:
      ```bash
      docker compose up --build --no-cache
      ```
- If you encounter any issues, check the terminal output for error messages and ensure that Docker is running properly on your machine.
- You can also access the Eureka dashboard at `http://localhost:8761` to see the registered services.
- For database management, you can use tools like pgAdmin for PostgreSQL and RedisInsight for Redis to connect to the respective databases using the provided ports.
- Make sure to have the **necessary environment variables set up** for the services to connect to the databases and other dependencies.
