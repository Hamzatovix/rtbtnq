/**
 * Node скрипт для диагностики запросов с фронтенда
 */
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { writeFileSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Читаем переменные окружения
function getEnvVar(name, defaultValue) {
  // Проверяем process.env напрямую (будет установлено при запуске)
  return process.env[name] || defaultValue;
}

const API_BASE_URL = getEnvVar('NEXT_PUBLIC_API_URL', 'http://localhost:8000/api');
const OUTPUT_DIR = join(projectRoot, 'diagnostics', 'output', 'front_samples');

// Создаем директорию для результатов
mkdirSync(OUTPUT_DIR, { recursive: true });

async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  console.log(`\n📡 Fetching: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    const status = response.status;
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { _raw: text };
    }
    
    const result = {
      url,
      status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      top_level_keys: typeof data === 'object' && data !== null ? Object.keys(data) : 'not_object',
      is_array: Array.isArray(data),
      items_count: Array.isArray(data) ? data.length : (data.results ? data.results.length : null),
      has_pagination: typeof data === 'object' && data !== null && ('count' in data || 'next' in data || 'previous' in data),
      sample: Array.isArray(data) 
        ? (data[0] || null)
        : (data.results ? data.results[0] || null : Object.keys(data).slice(0, 5).reduce((acc, key) => ({ ...acc, [key]: data[key] }), {})),
    };
    
    // Сохраняем полный ответ
    const filename = endpoint.replace(/[^a-zA-Z0-9]/g, '_') || 'root';
    writeFileSync(
      join(OUTPUT_DIR, `${filename}.json`),
      JSON.stringify(data, null, 2),
      'utf-8'
    );
    
    return result;
  } catch (error) {
    return {
      url,
      status: 'error',
      error: error.message,
      error_type: error.constructor.name,
    };
  }
}

async function main() {
  console.log('🔍 Frontend API Diagnostics');
  console.log('='.repeat(50));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Output Directory: ${OUTPUT_DIR}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    api_base_url: API_BASE_URL,
    endpoints: {},
  };
  
  // Проверяем основные endpoints
  results.endpoints.categories = await fetchApi('/categories/');
  results.endpoints.colors = await fetchApi('/colors/');
  results.endpoints.products = await fetchApi('/products/?ordering=-created_at&page=1');
  
  // Выводим результаты
  console.log('\n📊 Results Summary:');
  console.log('='.repeat(50));
  
  for (const [name, result] of Object.entries(results.endpoints)) {
    console.log(`\n${name.toUpperCase()}:`);
    console.log(`  Status: ${result.status}`);
    if (result.status === 200) {
      console.log(`  Type: ${result.is_array ? 'Array' : 'Object'}`);
      console.log(`  Top-level keys: ${result.top_level_keys}`);
      console.log(`  Has pagination: ${result.has_pagination}`);
      console.log(`  Items count: ${result.items_count}`);
    } else {
      console.log(`  Error: ${result.error || result.statusText}`);
    }
  }
  
  // Сохраняем сводку
  writeFileSync(
    join(OUTPUT_DIR, 'summary.json'),
    JSON.stringify(results, null, 2),
    'utf-8'
  );
  
  // Проверяем наличие ошибок
  const hasErrors = Object.values(results.endpoints).some(r => r.status !== 200);
  if (hasErrors) {
    console.error('\n❌ Some endpoints returned errors');
    process.exit(1);
  } else {
    console.log('\n✅ All endpoints responded successfully');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});


