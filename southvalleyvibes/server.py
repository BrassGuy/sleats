import http.server
import socketserver
import logging
import sys
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('server.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def log_message(self, format, *args):
        logging.info(f"{self.address_string()} - {format%args}")
    
    def log_error(self, format, *args):
        logging.error(f"{self.address_string()} - {format%args}")

    def handle_error(self, request, client_address):
        logging.error(f"Error handling request from {client_address}", exc_info=True)

PORT = 8000

def run_server():
    try:
        Handler = CORSHTTPRequestHandler
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            logging.info(f"Server started at http://localhost:{PORT}")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 98:  # Address already in use
            logging.error(f"Port {PORT} is already in use. Please close the other server or use a different port.")
        else:
            logging.error("Server error:", exc_info=True)
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error("Unexpected server error:", exc_info=True)

if __name__ == "__main__":
    run_server() 