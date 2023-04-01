import os
import openai
openai.api_key = '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'

completion = openai.ChatCompletion.create(
  model="gpt-3.5-turbo",
  messages=[
    {"role": "user", "content": "Hello!"}
  ]
)

print(completion.choices[0].message)
