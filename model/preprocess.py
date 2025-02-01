import json
import re
import html


def pretty_print(input_json, debug=False):
    pretty_json = json.dumps(input_json, indent=4, sort_keys=True)

    if debug:
        print(pretty_json)

    return pretty_json


def extract_content(input_json, debug=False):
    def clean(text):
        if not isinstance(text, str):
            return text
        # URLs
        text = re.sub(r'http\S+', '', text)
        # HTML tags
        text = re.sub(r'<.*?>', '', text)
        # newline and NBSP chars
        text = text.replace('\n', '').replace('&nbsp;', '')
        # unescape HTML
        text = html.unescape(text)
        return text

    def contains_href(text):
        return re.search(r'<a\s+href=', text) is not None

    def process_entry(entry):
        result = {}
        if "content" in entry and "$t" in entry["content"]:
            content = entry["content"]["$t"]
            # Here we are skipping blog posts that contain links, because this is likely a reposted article and not a
            # uniquely written post
            if contains_href(content):
                return None
            result["content"] = clean(content)
        if "title" in entry and "$t" in entry["title"]:
            result["title"] = clean(entry["title"]["$t"])
        return result

    processed_data = [process_entry(entry) for entry in input_json if process_entry(entry) is not None]

    if debug:
        print(processed_data)

    return processed_data


def final_pass_because_i_cant_code(input_json, debug=False):
    def contains_angle_brackets(text):
        return '<' in text or '>' in text

    # Always validate everything
    def validate_entry(entry):
        if "content" in entry and contains_angle_brackets(entry.get("content", "")):
            return False
        if "title" in entry and contains_angle_brackets(entry.get("title", "")):
            return False
        return True

    filtered_data = [entry for entry in input_json if validate_entry(entry)]

    if debug:
        print(filtered_data)

    return filtered_data


def preprocess(input_file, output_file=None, debug=False):
    try:
        with open(input_file, 'r', encoding='utf-8') as file:
            data = json.load(file)

            pretty_json = pretty_print(data, debug)
            processed_data = extract_content(pretty_json, debug)
            final_data = final_pass_because_i_cant_code(processed_data, debug)

        if output_file:
            with open(output_file, 'w', encoding='utf-8') as out_file:
                json.dump(final_data, out_file, indent=4)
            print(f"Final JSON has been saved to {output_file}")

    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
    except FileNotFoundError:
        print(f"File not found: {input_file}")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    file_in = "../data/raw/control/helpparentsagewell.blogspot.com/raw_posts.json"
    file_out = "../data/raw/control/helpparentsagewell.blogspot.com/final_raw_posts.json"

    preprocess(file_in, file_out, True)
