from transformers import AutoModelForSeq2SeqLM, AutoTokenizer
import sys

try:
    # Log the input message
    input_message = sys.argv[1] if len(sys.argv) > 1 else "No input provided"
    print(f"Input message received: {input_message}", file=sys.stderr)

    # Load the tokenizer and model
    tokenizer = AutoTokenizer.from_pretrained('GODEL-v1_1-base-seq2seq')
    model = AutoModelForSeq2SeqLM.from_pretrained(
        'GODEL-v1_1-base-seq2seq',
        local_files_only=True,
        low_cpu_mem_usage=False,  # Disable low_cpu_mem_usage
        torch_dtype="auto"
    )

    # Generate response
    inputs = tokenizer(input_message, return_tensors="pt")
    outputs = model.generate(**inputs)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # Print the response
    print(response)
except Exception as e:
    # Log any errors
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)  # Exit with a non-zero status code to indicate failure