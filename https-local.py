# Flask com HTTPS local (desenvolvimento)
from flask import Flask
import ssl

app = Flask(__name__)

if __name__ == '__main__':
    # Gera certificado auto-assinado
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain('cert.pem', 'key.pem')
    
    # Ou use certificado adhoc (Flask gera automaticamente)
    app.run(host='0.0.0.0', port=5000, ssl_context='adhoc', debug=True)
    
    # Para gerar certificados manualmente:
    # openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365