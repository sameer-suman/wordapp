from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route("/api/word-of-the-day", methods=["GET"])
def word_of_the_day():
    url = "https://www.dictionary.com/e/word-of-the-day/"
    response = requests.get(url)
    
    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch the Word of the Day"}), 500

    soup = BeautifulSoup(response.content, "html.parser")
    
    # Extract date
    date_section = soup.find('div', class_='otd-item-headword__date')
    date = date_section.time['datetime'] if date_section else "Unknown"

    # Extract word
    word_section = soup.find('div', class_='otd-item-headword__word')
    word = word_section.h1.text.strip() if word_section else "Unknown"

    # Extract meaning
    meaning_section = soup.find('div', class_='otd-item-headword__pos')
    meaning = meaning_section.find_all('p')[-1].text.strip() if meaning_section else "Unknown"

    # Extract type of word
    type_of_word = meaning_section.find('span', class_='luna-pos').text.strip() if meaning_section else "Unknown"

    # Extract IPA
    pronunciation_section = soup.find('span', class_='otd-item-headword__pronunciation__text')
    ipa = pronunciation_section.text.strip() if pronunciation_section else "Unknown"

    # Extract examples (ignoring "More about soigné")
    examples_header = soup.find('p', string=lambda text: text and "EXAMPLES OF" in text.upper())
    examples_section = examples_header.find_next('ul') if examples_header else None
    example_items = examples_section.find_all('li') if examples_section else []
    examples = [item.text.strip() for item in example_items]

    # Construct response
    return jsonify({
        "date": date,
        "word": word,
        "meaning": meaning,
        "type_of_word": type_of_word,
        "ipa": ipa,
        "examples": examples
    })

if __name__ == "__main__":
    app.run(debug=True)
