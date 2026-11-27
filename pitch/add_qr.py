"""Вставляет QR-код и ссылку на прототип в последний слайд деки.

    python3 pitch/add_qr.py https://ваш-сайт.vercel.app/saty [pitch/Qonaq_glow_v2.pptx]

Пишет рядом файл *_qr.pptx. Нужен пакет qrcode: pip3 install "qrcode[pil]"
"""
import io, re, sys, zipfile
import qrcode

url = sys.argv[1]
src = sys.argv[2] if len(sys.argv) > 2 else "pitch/Qonaq_glow_v2.pptx"
dst = src.replace(".pptx", "_qr.pptx")

qr = qrcode.QRCode(border=1, box_size=20, error_correction=qrcode.constants.ERROR_CORRECT_M)
qr.add_data(url)
png = io.BytesIO()
qr.make_image(fill_color="#0B2A21", back_color="#F1EDE0").save(png, format="PNG")

zin = zipfile.ZipFile(src)
# последний слайд по порядку в presentation.xml
pres = zin.read("ppt/presentation.xml").decode()
rels = zin.read("ppt/_rels/presentation.xml.rels").decode()
last_rid = re.findall(r'<p:sldId [^>]*r:id="(rId\d+)"', pres)[-1]
slide = re.search(rf'Id="{last_rid}"[^>]*Target="(slides/slide\d+\.xml)"', rels).group(1)
slide_path = "ppt/" + slide
srels_path = "ppt/slides/_rels/" + slide.split("/")[1] + ".rels"

x = zin.read(slide_path).decode()
r = zin.read(srels_path).decode()
rid = "rIdQr1"
r = r.replace("</Relationships>", f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/qr-prototype.png"/></Relationships>')

# заглушка «Место для QR» → картинка QR внутри светлой карточки
ph = re.search(r"<p:sp>(?:(?!</p:sp>).)*Место для QR.*?</p:sp>", x, re.S)
if not ph:
    sys.exit("Заглушка «Место для QR» не найдена: QR уже вставлен?")
inset = 91440
size = 1600200 - 2 * inset
pic = (f'<p:pic><p:nvPicPr><p:cNvPr id="40" name="!!qrimg" descr="QR-код: {url}"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr>'
       f'<p:blipFill><a:blip r:embed="{rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>'
       f'<p:spPr><a:xfrm><a:off x="{9509760 + inset}" y="{4251960 + inset}"/><a:ext cx="{size}" cy="{size}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic>')
x = x[:ph.start()] + pic + x[ph.end():]
shown = re.sub(r"^https?://", "", url).rstrip("/")
x = re.sub(r"(name=\"!!url\".*?<a:t>)[^<]*(</a:t>)", lambda m: m.group(1) + shown + m.group(2), x, count=1, flags=re.S)
# подпись шириной ~205 px: при 16 pt влезает ~28 символов, длиннее — уменьшаем шрифт (не меньше 10 pt)
if len(shown) > 28:
    sz = max(1000, int(1600 * 28 / len(shown)) // 50 * 50)
    i = x.index('name="!!url"'); j = x.index("</p:sp>", i)
    x = x[:i] + x[i:j].replace('sz="1600"', f'sz="{sz}"') + x[j:]

ct = zin.read("[Content_Types].xml").decode()
if 'Extension="png"' not in ct:
    ct = ct.replace("<Default ", '<Default Extension="png" ContentType="image/png"/><Default ', 1)

with zipfile.ZipFile(dst, "w", zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == slide_path: data = x.encode()
        elif item.filename == srels_path: data = r.encode()
        elif item.filename == "[Content_Types].xml": data = ct.encode()
        zout.writestr(item, data)
    zout.writestr("ppt/media/qr-prototype.png", png.getvalue())
print("Готово:", dst, "| подпись:", shown)
