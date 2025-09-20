import feedparser
from scipy.special import softmax
import numpy as np
from transformers import AutoTokenizer, AutoModelForSequenceClassification

tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")

def fetch_headlines_google(ticker, n=5):
    feed = feedparser.parse(f"https://news.google.com/rss/search?q={ticker}")
    print("Titles")
    return [e.title for e in feed.entries[:n]]

def score_text_finbert(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True)
    logits = model(**inputs).logits[0].detach().numpy()
    probs = softmax(logits)
    return float(probs[2] - probs[0])  # pos - neg


def aggregate_sentiment_for_tickers(tickers, n=5):
    scores = {}
    titles = {}
    for t in tickers:
        title = fetch_headlines_google(t, n)
        titles[t] = title
        if title:
            vals = [score_text_finbert(tt) for tt in title]
            scores[t] = float(np.mean(vals))
        else:
            scores[t] = 0.0
    
    print("Returning Sentiment")
    return scores, titles
