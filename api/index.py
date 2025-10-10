from flask import Flask, jsonify, request, session
from datetime import datetime
from flask_cors import CORS
import os
import sys
import hashlib
import json

# Adicionar o diretório raiz ao path para importar database_config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from database_config import (
        get_user_by_username, create_user, log_tool_usage, 
        get_tools, get_usage_statistics, init_database
    )
    DATABASE_AVAILABLE = True
except ImportError:
    DATABASE_AVAILABLE = False
    print("Database configuration not available. Running in fallback mode.")

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
CORS(app, supports_credentials=True)

def hash_password(password):
    """Hash da senha usando SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/')
def home():
    return jsonify({
        "message": "Servidor Python para EPQS está rodando!",
        "version": "1.0.0",
        "database_status": "connected" if DATABASE_AVAILABLE else "fallback_mode"
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    """Endpoint de verificação de saúde do sistema"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'database': 'connected' if DATABASE_AVAILABLE else 'fallback_mode'
    })

@app.route('/api/init-db', methods=['POST'])
def initialize_database():
    """Inicializa o banco de dados com as tabelas necessárias"""
    if not DATABASE_AVAILABLE:
        return jsonify({'error': 'Database not available'}), 500
    
    try:
        init_database()
        return jsonify({'message': 'Database initialized successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint de login"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password required'}), 400
    
    if DATABASE_AVAILABLE:
        try:
            user = get_user_by_username(username)
            if user and user['password_hash'] == hash_password(password):
                session['user_id'] = user['id']
                session['username'] = user['username']
                return jsonify({
                    'message': 'Login successful',
                    'user': {
                        'id': user['id'],
                        'username': user['username'],
                        'email': user['email']
                    }
                })
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        # Modo fallback - login simples para desenvolvimento
        if username == 'admin' and password == 'admin':
            session['user_id'] = 1
            session['username'] = username
            return jsonify({
                'message': 'Login successful (fallback mode)',
                'user': {'id': 1, 'username': username, 'email': 'admin@epqs.com'}
            })
        else:
            return jsonify({'error': 'Invalid credentials (fallback mode)'}), 401

@app.route('/api/register', methods=['POST'])
def register():
    """Endpoint de registro de usuário"""
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email and password required'}), 400
    
    if DATABASE_AVAILABLE:
        try:
            # Verificar se usuário já existe
            existing_user = get_user_by_username(username)
            if existing_user:
                return jsonify({'error': 'Username already exists'}), 409
            
            # Criar novo usuário
            password_hash = hash_password(password)
            user_id = create_user(username, email, password_hash)
            
            return jsonify({
                'message': 'User created successfully',
                'user_id': user_id
            }), 201
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Registration not available in fallback mode'}), 503

@app.route('/api/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    session.clear()
    return jsonify({'message': 'Logout successful'})

@app.route('/api/tools', methods=['GET'])
def get_tools_list():
    """Retorna lista de ferramentas disponíveis"""
    if DATABASE_AVAILABLE:
        try:
            tools = get_tools()
            return jsonify({'tools': tools})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        # Lista de ferramentas em modo fallback
        fallback_tools = [
            {'id': 1, 'name': '5 Porquês', 'category': 'Qualidade', 'file_path': '5_porques.html'},
            {'id': 2, 'name': '5S', 'category': 'Organização', 'file_path': '5s.html'},
            {'id': 3, 'name': 'FMEA', 'category': 'Qualidade', 'file_path': 'fmea.html'},
            {'id': 4, 'name': 'Ishikawa', 'category': 'Qualidade', 'file_path': 'ishikawa.html'},
            {'id': 5, 'name': 'Pareto', 'category': 'Estatística', 'file_path': 'pareto.html'}
        ]
        return jsonify({'tools': fallback_tools})

@app.route('/api/log-usage', methods=['POST'])
def log_usage():
    """Registra o uso de uma ferramenta"""
    data = request.get_json()
    tool_id = data.get('tool_id')
    session_duration = data.get('session_duration')
    data_saved = data.get('data_saved')
    
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'User not logged in'}), 401
    
    if DATABASE_AVAILABLE:
        try:
            log_tool_usage(user_id, tool_id, session_duration, data_saved)
            return jsonify({'message': 'Usage logged successfully'})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'message': 'Usage logged (fallback mode)'})

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Retorna estatísticas de uso"""
    user_id = session.get('user_id')
    
    if DATABASE_AVAILABLE:
        try:
            stats = get_usage_statistics(user_id)
            return jsonify({'statistics': stats})
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        # Estatísticas de exemplo em modo fallback
        fallback_stats = [
            {'name': '5 Porquês', 'usage_count': 5, 'avg_duration': 300},
            {'name': 'FMEA', 'usage_count': 3, 'avg_duration': 600},
            {'name': 'Ishikawa', 'usage_count': 2, 'avg_duration': 450}
        ]
        return jsonify({'statistics': fallback_stats})

@app.route('/api/data', methods=['GET'])
def get_data():
    """Endpoint de dados genérico (compatibilidade)"""
    data = {
        'message': 'Dados do servidor Python',
        'timestamp': datetime.now().isoformat(),
        'database_status': 'connected' if DATABASE_AVAILABLE else 'fallback_mode'
    }
    return jsonify(data)

@app.route('/api/save', methods=['POST'])
def save_data():
    """Endpoint de salvamento genérico (compatibilidade)"""
    content = request.json
    print(f"Dados recebidos: {content}")
    
    # Log do uso se disponível
    if DATABASE_AVAILABLE and 'tool_id' in content:
        user_id = session.get('user_id')
        if user_id:
            try:
                log_tool_usage(user_id, content['tool_id'], data_saved=content)
            except Exception as e:
                print(f"Erro ao registrar uso: {e}")
    
    return jsonify({'status': 'success', 'message': 'Dados salvos com sucesso!'})

# Vercel requires the app to be exposed as a variable
if __name__ == '__main__':
    app.run(debug=True)
