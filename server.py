"""Head Hunters portal demo. No API credentials or dependencies required."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).resolve().parent), **kwargs)
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    print('Head Hunters portal demo: http://localhost:8002', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 8002), Handler).serve_forever()
