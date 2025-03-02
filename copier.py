import os
import concurrent.futures
import re
from fuzzywuzzy import fuzz
from collections import defaultdict
from nltk.corpus import wordnet
import wikipediaapi
import openai
import json

# Initialize OpenAI API (optional)
openai.api_key = "your_openai_api_key_here"
wiki_wiki = wikipediaapi.Wikipedia(language='en', user_agent="my-cool-script/1.0")

# Expanded local keyword database
KEYWORD_DATABASE = {
    "image": ["image", "img", "picture", "photo", "multer", "upload", "cloudinary", "file", "storage", "gallery", "thumbnail"],
    "server": ["server", "api", "backend", "express", "route", "endpoint", "request", "response", "rest", "graphql", "socket"],
    "authentication": ["auth", "login", "register", "jwt", "token", "password", "session", "oauth", "firebase", "passport"],
    "database": ["database", "mongodb", "mongoose", "sql", "query", "schema", "model", "collection", "index", "aggregation"],
    "frontend": ["react", "jsx", "component", "state", "props", "tailwind", "css", "html", "redux", "context", "hooks"],
    "security": ["security", "encrypt", "hash", "cors", "xss", "csrf", "firewall", "https", "ssl", "tls"],
}

# Function to fetch synonyms using WordNet
def get_synonyms(word):
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().lower())
    return list(synonyms)

# Function to fetch related terms from Wikipedia
def get_wikipedia_terms(word):
    try:
        page = wiki_wiki.page(word)
        if page.exists():
            return [word.lower()] + [term.lower() for term in page.links.keys()]
        return [word.lower()]
    except Exception as e:
        print(f"Wikipedia API error: {e}")
        return [word.lower()]

# Function to fetch related terms from OpenAI API (optional)
def get_openai_related_terms(word):
    try:
        response = openai.Completion.create(
            model="text-davinci-003",
            prompt=f"Please provide related terms and concepts for the word '{word}'.",
            max_tokens=50
        )
        return [term.strip().lower() for term in response.choices[0].text.split(",")]
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return []

# Function to expand input words using WordNet, Wikipedia, and local database
def expand_keywords(input_words):
    expanded_keywords = set()
    for word in input_words:
        word = word.lower()  # Ensure case insensitivity
        # Add local database keywords
        if word in KEYWORD_DATABASE:
            expanded_keywords.update(KEYWORD_DATABASE[word])
        # Add synonyms from WordNet
        expanded_keywords.update(get_synonyms(word))
        # Add related terms from Wikipedia
        expanded_keywords.update(get_wikipedia_terms(word))
        # Add related terms from OpenAI
        expanded_keywords.update(get_openai_related_terms(word))
    return list(expanded_keywords)

# Function to check if a file is a code file (only allowed extensions)
def is_code_file(file_path):
    allowed_extensions = ['.js', '.jsx', '.json', '.cjs', '.html']
    return any(file_path.lower().endswith(ext) for ext in allowed_extensions)

# Function to categorize a file based on its path and content
def categorize_file(file_path, content):
    if "backend" in file_path.lower() or "server" in file_path.lower():
        return "backend"
    elif "frontend" in file_path.lower() or "src" in file_path.lower():
        return "frontend"
    elif "database" in file_path.lower() or "models" in file_path.lower():
        return "database"
    elif "security" in file_path.lower() or "auth" in file_path.lower():
        return "security"
    return "other"

# Function to compress file content
def compress_content(content, keywords):
    # Remove comments and extra whitespace
    content = re.sub(r'//.*?\n|/\*.*?\*/', '', content, flags=re.DOTALL)  # Remove comments
    content = re.sub(r'\s+', ' ', content)  # Replace multiple spaces with a single space
    # Only include lines containing keywords
    relevant_lines = [line for line in content.splitlines() if any(re.search(rf'\b{re.escape(keyword)}\b', line, re.IGNORECASE) for keyword in keywords)]
    return " ".join(relevant_lines)

# Function to check if a file matches the expanded keywords
def file_matches_keywords(file_path, keywords):
    try:
        if not is_code_file(file_path):
            return False  # Ignore non-code files

        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check file name (case-insensitive)
        file_name = os.path.basename(file_path).lower()
        if any(fuzz.partial_ratio(keyword, file_name) > 70 for keyword in keywords):
            return True
        
        # Check file content (case-insensitive)
        if any(re.search(rf'\b{re.escape(keyword)}\b', content, re.IGNORECASE) for keyword in keywords):
            return True
        
        # Check variable names (basic regex for variable names)
        variable_pattern = r'\b(?:var|let|const|function)\s+([a-zA-Z_]\w*)\b'
        variables = re.findall(variable_pattern, content)
        if any(fuzz.partial_ratio(keyword, var.lower()) > 70 for var in variables for keyword in keywords):
            return True
        
        return False
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return False

# Function to process a single file and check for keyword matches
def process_file(file_path, keywords):
    if file_matches_keywords(file_path, keywords):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            compressed_content = compress_content(content, keywords)
            category = categorize_file(file_path, content)
            return file_path, compressed_content, category
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
            return file_path, None, None
    return file_path, None, None

# Function to collect all files in the directory (excluding certain folders and files)
def collect_files(root):
    found = []
    for dirpath, dirnames, filenames in os.walk(root):
        # Skip specific directories and files
        if 'node_modules' in dirnames:
            dirnames.remove('node_modules')  # Skip node_modules
        if 'dist' in dirnames:
            dirnames.remove('dist')  # Skip dist folder
        if 'util' in dirnames:
            dirnames.remove('util')  # Skip util folder
        if 'controllers' in dirnames:
            dirnames.remove('controllers')  # Skip controllers folder

        for filename in filenames:
            # Skip package-lock.json, errorHandler.js, and other non-code files
            if filename == "package-lock.json" or filename == "errorHandler.js":
                continue
            file_path = os.path.join(dirpath, filename)
            if is_code_file(file_path):  # Only collect code files
                found.append(file_path)
    return found

# Function to write results to the output file in JSON format
def write_to_output_file(outf, results):
    categorized_results = defaultdict(list)
    for file_path, content, category in results:
        if content:
            categorized_results[category].append({"file": file_path, "content": content})
    
    # Write results in JSON format
    json.dump(categorized_results, outf, indent=2)

# Main function
def main():
    root = os.getcwd()
    print("Searching in:", root)
    
    # Get user input and expand keywords
    user_input = input("Enter keywords (e.g., 'image server'): ").strip().lower()
    input_words = user_input.split()
    keywords = expand_keywords(input_words)
    print(f"Expanded keywords: {keywords}")
    
    # Collect all files
    files = collect_files(root)
    
    # Use ThreadPoolExecutor for concurrent file processing
    with concurrent.futures.ThreadPoolExecutor() as executor:
        results = list(executor.map(lambda f: process_file(f, keywords), files))
    
    # Filter out files with no matches
    results = [r for r in results if r[1] is not None]
    
    # Write the results to an output file in JSON format
    with open("related_files.json", "w", encoding="utf-8") as outf:
        write_to_output_file(outf, results)
    
    # Print the paths of the files processed
    print(f"\nProcessed files:")
    for file_path, _, _ in results:
        print(file_path)
    
    print(f"\nFinished processing. {len(results)} files saved in 'related_files.json'.")

# Run the main function if this script is executed
if __name__ == "__main__":
    # Download WordNet data (required for NLTK)
    import nltk
    nltk.download('wordnet')
    nltk.download('omw-1.4')
    main()