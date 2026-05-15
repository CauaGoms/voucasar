import qrcode
import base64
from io import BytesIO
import unicodedata

def format_pix_value(id_field, value):
    return f"{id_field}{len(value):02d}{value}"

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return u"".join([c for c in nfkd_form if not unicodedata.combining(c)])

def calculate_crc16(payload):
    polynomial = 0x1021
    crc = 0xFFFF
    for byte in payload.encode('utf-8'):
        crc ^= (byte << 8)
        for _ in range(8):
            if (crc & 0x8000):
                crc = (crc << 1) ^ polynomial
            else:
                crc = (crc << 1)
            crc &= 0xFFFF
    return hex(crc)[2:].upper().zfill(4)

def gerar_payload_pix(chave_pix, valor, nome_recebedor, cidade_recebedor, txid="***"):
    # Sanitize inputs (no accents, uppercase)
    nome_recebedor = remove_accents(nome_recebedor).upper()[:25]
    cidade_recebedor = remove_accents(cidade_recebedor).upper()[:15]
    
    # 00 - Payload Format Indicator (01)
    payload_format = format_pix_value("00", "01")
    
    # 26 - Merchant Account Information (GUI + PIX KEY)
    gui = format_pix_value("00", "br.gov.bcb.pix")
    chave = format_pix_value("01", chave_pix)
    merchant_account_info = format_pix_value("26", gui + chave)
    
    # 52 - Merchant Category Code (0000)
    merchant_category_code = format_pix_value("52", "0000")
    
    # 53 - Transaction Currency (986 = BRL)
    transaction_currency = format_pix_value("53", "986")
    
    # 54 - Transaction Amount
    transaction_amount = ""
    if valor:
        transaction_amount = format_pix_value("54", f"{float(valor):.2f}")
    
    # 58 - Country Code (BR)
    country_code = format_pix_value("58", "BR")
    
    # 59 - Merchant Name
    merchant_name = format_pix_value("59", nome_recebedor)
    
    # 60 - Merchant City
    merchant_city = format_pix_value("60", cidade_recebedor)
    
    # 62 - Additional Data Field Template
    additional_data = format_pix_value("62", format_pix_value("05", txid))
    
    # Combine fields
    payload = (
        payload_format + 
        merchant_account_info + 
        merchant_category_code + 
        transaction_currency + 
        transaction_amount + 
        country_code + 
        merchant_name + 
        merchant_city + 
        additional_data + 
        "6304" # 63 - CRC16 prefix (04 is length)
    )
    
    crc16 = calculate_crc16(payload)
    return payload + crc16

def gerar_qr_code_base64(payload):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode("utf-8")
