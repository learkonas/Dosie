import csv

with open('./c3posts.csv', newline='', errors="replace") as f:
    reader = csv.reader(f)
    for row in reader:
        for col in row:
            if '\x8d' in col:
                print(f"Soft hyphen found in row {reader.line_num}, column {row.index(col)}")