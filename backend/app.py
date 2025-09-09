from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from api.routes.portfolio import portfolio_bp

# Create Flask app
app = Flask(__name__)

# Configure app
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'defaultSecretKeyForDevelopmentEnvironmentOnly')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400000  # 24 hours in milliseconds to match Spring Boot

# Initialize extensions
jwt = JWTManager(app)

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({
        'status': 401,
        'sub_status': 42,
        'message': 'The token has expired'
    }), 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return jsonify({
        'status': 401,
        'sub_status': 42,
        'message': 'Signature verification failed'
    }), 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return jsonify({
        'status': 401,
        'sub_status': 42,
        'message': 'Authorization header is missing'
    }), 401

# Enable CORS only for API routes
cors_origins = os.environ.get('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174').split(',')
CORS(app, resources={r"/api/*": {"origins": cors_origins}}, supports_credentials=True)


# Register blueprints with /api prefix
app.register_blueprint(portfolio_bp, url_prefix='/api/portfolio')

# Root route
@app.route('/')
def index():
    return jsonify({
        'message': 'Welcome to QFIN API',
        'status': 'online'
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
