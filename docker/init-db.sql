-- Create ai_coder user with all necessary permissions
CREATE USER ai_coder WITH PASSWORD 'dev_password';
ALTER USER ai_coder CREATEDB;
GRANT ALL PRIVILEGES ON DATABASE ai_coder_dev TO ai_coder;

-- Connect to the database and set up schema permissions
\c ai_coder_dev;

GRANT ALL ON SCHEMA public TO ai_coder;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ai_coder;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ai_coder;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO ai_coder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ai_coder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ai_coder;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ai_coder;