"""
Configuração de banco de dados para o sistema EPQS
Usando Neon PostgreSQL como banco de dados de produção
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

# String de conexão do banco de dados (será configurada como variável de ambiente na Vercel)
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost/epqs_db')

@contextmanager
def get_db_connection():
    """
    Context manager para conexões com o banco de dados
    Garante que as conexões sejam fechadas adequadamente
    """
    conn = None
    try:
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()

def init_database():
    """
    Inicializa o banco de dados com as tabelas necessárias
    """
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Tabela de usuários
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP,
                is_active BOOLEAN DEFAULT TRUE
            )
        """)
        
        # Tabela de ferramentas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tools (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                category VARCHAR(50),
                file_path VARCHAR(255),
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de uso de ferramentas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tool_usage (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                tool_id INTEGER REFERENCES tools(id),
                usage_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                session_duration INTEGER, -- em segundos
                data_saved JSONB -- dados salvos pela ferramenta
            )
        """)
        
        # Tabela de relatórios
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                title VARCHAR(200) NOT NULL,
                content JSONB,
                report_type VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Tabela de configurações do sistema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS system_settings (
                id SERIAL PRIMARY KEY,
                setting_key VARCHAR(100) UNIQUE NOT NULL,
                setting_value JSONB,
                description TEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Inserir ferramentas padrão
        cursor.execute("""
            INSERT INTO tools (name, description, category, file_path) VALUES
            ('5 Porquês', 'Ferramenta para análise de causa raiz', 'Qualidade', '5_porques.html'),
            ('5S', 'Metodologia de organização do local de trabalho', 'Organização', '5s.html'),
            ('8D', 'Metodologia de resolução de problemas', 'Qualidade', '8d.html'),
            ('APQP', 'Planejamento Avançado da Qualidade do Produto', 'Planejamento', 'apqp.html'),
            ('CEP', 'Controle Estatístico de Processo', 'Estatística', 'cep.html'),
            ('Controle de Injeção', 'Controle de processo de injeção', 'Processo', 'controle_injecao.html'),
            ('Cronoanálise', 'Análise de tempos e métodos', 'Produtividade', 'cronoanalise.html'),
            ('Dashboard de Indicadores', 'Painel de indicadores', 'Gestão', 'DashboarddeIndicadores.html'),
            ('Diagrama de Dispersão', 'Análise de correlação entre variáveis', 'Estatística', 'diagrama-dispersao.html'),
            ('DMAIC', 'Metodologia Seis Sigma', 'Qualidade', 'dmaic.html'),
            ('Estamparia', 'Controle de processo de estamparia', 'Processo', 'estamparia.html'),
            ('FMEA', 'Análise de Modo e Efeito de Falha', 'Qualidade', 'fmea.html'),
            ('Folha de Verificação', 'Coleta de dados estruturada', 'Qualidade', 'folha_verificacao.html'),
            ('Gerenciador de Dashboards', 'Gestão de painéis', 'Gestão', 'GerenciadordeDashboards.html'),
            ('Histograma', 'Análise de distribuição de dados', 'Estatística', 'histograma.html'),
            ('Ishikawa', 'Diagrama de causa e efeito', 'Qualidade', 'ishikawa.html'),
            ('Kaizen', 'Melhoria contínua', 'Melhoria', 'kaizen.html'),
            ('Manutenção', 'Gestão de manutenção', 'Manutenção', 'manutencao.html'),
            ('Mapeamento de Processos', 'Visualização de processos', 'Processo', 'mapeamento-de-processos.html'),
            ('MASP', 'Método de Análise e Solução de Problemas', 'Qualidade', 'masp.html'),
            ('Matriz Esforço-Impacto', 'Priorização de ações', 'Gestão', 'matriz-esforco-impacto.html'),
            ('Matriz GUT', 'Priorização por Gravidade, Urgência e Tendência', 'Gestão', 'matriz-gut.html'),
            ('MSA', 'Análise do Sistema de Medição', 'Qualidade', 'msa.html'),
            ('Pareto', 'Análise de Pareto', 'Estatística', 'pareto.html'),
            ('Planejamento', 'Ferramenta de planejamento', 'Planejamento', 'planejamento.html'),
            ('PPAP', 'Processo de Aprovação de Peça de Produção', 'Qualidade', 'ppap.html'),
            ('Relatório A3', 'Relatório estruturado A3', 'Gestão', 'relatorio-a3.html'),
            ('Sucata', 'Controle de sucata', 'Qualidade', 'sucata.html'),
            ('SWOT', 'Análise de forças, fraquezas, oportunidades e ameaças', 'Estratégia', 'swot.html'),
            ('Treinamento', 'Gestão de treinamentos', 'RH', 'treinamento.html'),
            ('VSM', 'Mapeamento do Fluxo de Valor', 'Processo', 'vsm.html'),
            ('SMED', 'Troca Rápida de Ferramentas', 'Produtividade', 'smed.html')
            ON CONFLICT (name) DO NOTHING
        """)
        
        conn.commit()
        print("Banco de dados inicializado com sucesso!")

def get_user_by_username(username):
    """Busca usuário por nome de usuário"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        return cursor.fetchone()

def create_user(username, email, password_hash):
    """Cria um novo usuário"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO users (username, email, password_hash) VALUES (%s, %s, %s) RETURNING id",
            (username, email, password_hash)
        )
        user_id = cursor.fetchone()['id']
        conn.commit()
        return user_id

def log_tool_usage(user_id, tool_id, session_duration=None, data_saved=None):
    """Registra o uso de uma ferramenta"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO tool_usage (user_id, tool_id, session_duration, data_saved) VALUES (%s, %s, %s, %s)",
            (user_id, tool_id, session_duration, data_saved)
        )
        conn.commit()

def get_tools():
    """Retorna todas as ferramentas ativas"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tools WHERE is_active = TRUE ORDER BY name")
        return cursor.fetchall()

def get_usage_statistics(user_id=None):
    """Retorna estatísticas de uso das ferramentas"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("""
                SELECT t.name, COUNT(tu.id) as usage_count, 
                       AVG(tu.session_duration) as avg_duration
                FROM tools t
                LEFT JOIN tool_usage tu ON t.id = tu.tool_id AND tu.user_id = %s
                GROUP BY t.id, t.name
                ORDER BY usage_count DESC
            """, (user_id,))
        else:
            cursor.execute("""
                SELECT t.name, COUNT(tu.id) as usage_count, 
                       AVG(tu.session_duration) as avg_duration
                FROM tools t
                LEFT JOIN tool_usage tu ON t.id = tu.tool_id
                GROUP BY t.id, t.name
                ORDER BY usage_count DESC
            """)
        return cursor.fetchall()

if __name__ == "__main__":
    # Inicializar banco de dados quando executado diretamente
    init_database()
