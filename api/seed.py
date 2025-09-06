# api/seed.py
from sqlmodel import Session, select
from database import engine
from models import Symbol

# 日本株 (日経225全銘柄)
nikkei225_symbols_data = [
  { "label": "信越化学工業", "value": "TRADU:4063" },
  { "label": "三菱ケミカルグループ", "value": "TRADU:4188" },
  { "label": "武田薬品工業", "value": "TRADU:4502" },
  { "label": "アステラス製薬", "value": "TRADU:4503" },
  { "label": "エーザイ", "value": "TRADU:4523" },
  { "label": "第一三共", "value": "TRADU:4568" },
  { "label": "日本製鉄", "value": "TRADU:5401" },
  { "label": "JFEホールディングス", "value": "TRADU:5411" },
  { "label": "リクルートホールディングス", "value": "TRADU:6098" },
  { "label": "ダイキン工業", "value": "TRADU:6367" },
  { "label": "日立製作所", "value": "TRADU:6501" },
  { "label": "ニデック", "value": "TRADU:6594" },
  { "label": "シャープ", "value": "TRADU:6753" },
  { "label": "ソニーグループ", "value": "TRADU:6758" },
  { "label": "アドバンテスト", "value": "TRADU:6857" },
  { "label": "キーエンス", "value": "TRADU:6861" },
  { "label": "ファナック", "value": "TRADU:6954" },
  { "label": "村田製作所", "value": "TRADU:6981" },
  { "label": "三菱重工業", "value": "TRADU:7011" },
  { "label": "トヨタ自動車", "value": "TRADU:7203" },
  { "label": "本田技研工業", "value": "TRADU:7267" },
  { "label": "スズキ", "value": "TRADU:7269" },
  { "label": "バンダイナムコホールディングス", "value": "TRADU:7832" },
  { "label": "任天堂", "value": "TRADU:7974" },
  { "label": "丸紅", "value": "TRADU:8002" },
  { "label": "三井物産", "value": "TRADU:8031" },
  { "label": "東京エレクトロン", "value": "TRADU:8035" },
  { "label": "住友商事", "value": "TRADU:8053" },
  { "label": "三菱商事", "value": "TRADU:8058" },
  { "label": "三菱UFJフィナンシャル・グループ", "value": "TRADU:8306" },
  { "label": "三井住友フィナンシャルグループ", "value": "TRADU:8316" },
  { "label": "みずほフィナンシャルグループ", "value": "TRADU:8411" },
  { "label": "日本郵船", "value": "TRADU:9101" },
  { "label": "商船三井", "value": "TRADU:9104" },
  { "label": "川崎汽船", "value": "TRADU:9107" },
  { "label": "日本電信電話 (NTT)", "value": "TRADU:9432" },
  { "label": "KDDI", "value": "TRADU:9433" },
  { "label": "ファーストリテイリング", "value": "TRADU:9983" },
  { "label": "ソフトバンクグループ", "value": "TRADU:9984" },
  { "label": "メルカリ", "value": "TRADU:4385" },
  { "label": "オリエンタルランド", "value": "TRADU:4661" },
  { "label": "ディスコ", "value": "TRADU:6146" },
];

# 米国株 (主要銘柄)
us_stock_symbols_data = [
  # NASDAQ
  { "label": "Apple", "value": "NASDAQ:AAPL" },
  { "label": "Microsoft", "value": "NASDAQ:MSFT" },
  { "label": "Amazon.com", "value": "NASDAQ:AMZN" },
  { "label": "NVIDIA", "value": "NASDAQ:NVDA" },
  { "label": "Alphabet (Google)", "value": "NASDAQ:GOOGL" },
  { "label": "Meta Platforms (Facebook)", "value": "NASDAQ:META" },
  { "label": "Tesla", "value": "NASDAQ:TSLA" },
  { "label": "Broadcom", "value": "NASDAQ:AVGO" },
  { "label": "Costco Wholesale", "value": "NASDAQ:COST" },
  { "label": "Adobe", "value": "NASDAQ:ADBE" },
  { "label": "Netflix", "value": "NASDAQ:NFLX" },
  { "label": "Intel", "value": "NASDAQ:INTC" },
  { "label": "AMD", "value": "NASDAQ:AMD" },
  { "label": "PepsiCo", "value": "NASDAQ:PEP" },
  { "label": "Cisco Systems", "value": "NASDAQ:CSCO" },
  { "label": "Qualcomm", "value": "NASDAQ:QCOM" },
  { "label": "Starbucks", "value": "NASDAQ:SBUX" },
  { "label": "Texas Instruments", "value": "NASDAQ:TXN" },
  { "label": "Intuitive Surgical", "value": "NASDAQ:ISRG" },
  { "label": "Micron Technology", "value": "NASDAQ:MU" },
  { "label": "Moderna", "value": "NASDAQ:MRNA" },
  { "label": "Applied Materials", "value": "NASDAQ:AMAT" },
  { "label": "ASML Holding", "value": "NASDAQ:ASML" },
  { "label": "Comcast", "value": "NASDAQ:CMCSA" },
  { "label": "PayPal", "value": "NASDAQ:PYPL" },
  { "label": "Marriott International", "value": "NASDAQ:MAR" },
  { "label": "Airbnb", "value": "NASDAQ:ABNB" },
  # NYSE
  { "label": "Berkshire Hathaway (Class B)", "value": "NYSE:BRK.B" },
  { "label": "Eli Lilly and Company", "value": "NYSE:LLY" },
  { "label": "Visa", "value": "NYSE:V" },
  { "label": "JPMorgan Chase & Co.", "value": "NYSE:JPM" },
  { "label": "Exxon Mobil", "value": "NYSE:XOM" },
  { "label": "UnitedHealth Group", "value": "NYSE:UNH" },
  { "label": "Johnson & Johnson", "value": "NYSE:JNJ" },
  { "label": "Mastercard", "value": "NYSE:MA" },
  { "label": "Procter & Gamble", "value": "NYSE:PG" },
  { "label": "Home Depot", "value": "NYSE:HD" },
  { "label": "Merck & Co.", "value": "NYSE:MRK" },
  { "label": "Chevron", "value": "NYSE:CVX" },
  { "label": "Walmart", "value": "NYSE:WMT" },
  { "label": "Bank of America", "value": "NYSE:BAC" },
  { "label": "Coca-Cola", "value": "NYSE:KO" },
  { "label": "Oracle", "value": "NYSE:ORCL" },
  { "label": "McDonald's", "value": "NYSE:MCD" },
  { "label": "Salesforce", "value": "NYSE:CRM" },
  { "label": "Pfizer", "value": "NYSE:PFE" },
  { "label": "Walt Disney", "value": "NYSE:DIS" },
  { "label": "Caterpillar", "value": "NYSE:CAT" },
  { "label": "Goldman Sachs", "value": "NYSE:GS" },
  { "label": "IBM", "value": "NYSE:IBM" },
  { "label": "American Express", "value": "NYSE:AXP" },
  { "label": "General Electric", "value": "NYSE:GE" },
  { "label": "Boeing", "value": "NYSE:BA" },
  { "label": "3M", "value": "NYSE:MMM" },
  { "label": "Nike", "value": "NYSE:NKE" },
  { "label": "Starbucks", "value": "NYSE:SBUX" },
  { "label": "Morgan Stanley", "value": "NYSE:MS" },
  { "label": "Ford Motor Company", "value": "NYSE:F" },
  { "label": "General Motors", "value": "NYSE:GM" },
];

# 為替 (FX)
fx_symbols_data = [
  { "label": "米ドル/円", "value": "FX:USDJPY" },
  { "label": "ユーロ/円", "value": "FX:EURJPY" },
  { "label": "英ポンド/円", "value": "FX:GBPJPY" },
  { "label": "豪ドル/円", "value": "FX:AUDJPY" },
  { "label": "メキシコペソ/円", "value": "FX:MXNJPY" },
  { "label": "ユーロ/米ドル", "value": "FX:EURUSD" },
  { "label": "ランド/円", "value": "FX:ZARJPY" },
  { "label": "NZドル/円", "value": "FX:NZDJPY" },
  { "label": "ブラジルレアル/円", "value": "FX:BRLJPY" },
  { "label": "豪ドル/米ドル", "value": "FX:AUDUSD" },
  { "label": "ユーロ/豪ドル", "value": "FX:EURAUD" },
  { "label": "英ポンド/米ドル", "value": "FX:GBPUSD" },
  { "label": "カナダドル/円", "value": "FX:CADJPY" },
  { "label": "スイスフラン/円", "value": "FX:CHFJPY" },
  { "label": "シンガポールドル/円", "value": "FX:SGDJPY" },
  { "label": "香港ドル/円", "value": "FX:HKDJPY" },
  { "label": "フィリピンペソ/円", "value": "FX:PHPJPY" },
  { "label": "ベトナムドン/円", "value": "FX:VNDJPY" },
  { "label": "台湾ドル/円", "value": "FX:TWDJPY" },
  { "label": "トルコリラ/円", "value": "FX:TRYJPY" },
  { "label": "インドネシアルピア/円", "value": "FX:IDRJPY" },
  { "label": "ロシアルーブル/円", "value": "FX:RUBJPY" },
  { "label": "インドルピー/円", "value": "FX:INRJPY" },
  { "label": "スウェーデンクローナ/円", "value": "FX:SEKJPY" },
  { "label": "ノルウェークローネ/円", "value": "FX:NOKJPY" },
  { "label": "デンマーククローネ/円", "value": "FX:DKKJPY" },
  { "label": "ポーランドズロチ/円", "value": "FX:PLNJPY" },
  { "label": "マレーシアリンギット/円", "value": "FX:MYRJPY" },
  { "label": "タイバーツ/円", "value": "FX:THBJPY" },
  { "label": "韓国ウォン/円", "value": "FX:KRWJPY" },
  { "label": "中国人民元/円", "value": "FX:CNHJPY" },
  { "label": "NZドル/スイスフラン", "value": "FX:NZDCHF" },
  { "label": "豪ドル/スイスフラン", "value": "FX:AUDCHF" },
  { "label": "英ポンド/スイスフラン", "value": "FX:GBPCHF" },
  { "label": "米ドル/スイスフラン", "value": "FX:USDCHF" },
  { "label": "英ポンド/NZドル", "value": "FX:GBPNZD" },
];

# インデックス
index_symbols_data = [
  { "label": "日経平均 (Nikkei 225)", "value": "NIKKEI225" },
  { "label": "TOPIX", "value": "IG:TOPIX" },
  { "label": "S&P 500", "value": "VANTAGE:SP500" },
  { "label": "NASDAQ 100", "value": "NASDAQ:NDX" },
  { "label": "ダウ平均 (DJI)", "value": "DJI" },
  { "label": "ラッセル 2000", "value": "RUSSELL" },
  { "label": "ドイツ DAX", "value": "XETR:DAX" },
  { "label": "イギリス FTSE 100", "value": "FTSE100" },
  { "label": "フランス CAC 40", "value": "CAC40" },
  { "label": "香港ハンセン指数", "value": "HSI" },
  { "label": "上海総合指数", "value": "950096" },
];


def seed_data():
    with Session(engine) as session:
        # 既存のデータを削除
        symbols_to_delete = session.exec(select(Symbol)).all()
        for symbol in symbols_to_delete:
            session.delete(symbol)
        print("Deleted existing symbols.")

        symbols_to_add = []
        for s in nikkei225_symbols_data:
            symbols_to_add.append(Symbol(label=s["label"], value=s["value"], category="japan"))
        for s in us_stock_symbols_data:
            symbols_to_add.append(Symbol(label=s["label"], value=s["value"], category="us"))
        for s in fx_symbols_data:
            symbols_to_add.append(Symbol(label=s["label"], value=s["value"], category="fx"))
        for s in index_symbols_data:
            symbols_to_add.append(Symbol(label=s["label"], value=s["value"], category="index"))

        session.add_all(symbols_to_add)
        session.commit()
        print("Seeding finished.")

if __name__ == "__main__":
    seed_data()

# シードの作成方法
# python seed.py