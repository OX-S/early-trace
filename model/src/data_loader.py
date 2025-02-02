import json


def _load_data_from_json_files(file_paths):
    """
    Loads and concatenates data from multiple JSON files.
    Expects each file to contain a list of dicts with at least a 'content' key.

    :param file_paths: A list of JSON file paths.
    :return: A single list of dicts, concatenated from all files.
    """
    all_data = []
    for file_path in file_paths:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)  # Each file is a list of dicts
            all_data.extend(data)
    return all_data


class DataLoader:
    """
    Loads and prepares datasets from two groups of JSON files:
    - Dementia (experimental) group
    - Non-dementia (control) group
    """

    def __init__(self, dementia_files, non_dementia_files):
        """
        :param dementia_files: List of file paths for the dementia group
        :param non_dementia_files: List of file paths for the non-dementia group
        """
        self.dementia_files = dementia_files
        self.non_dementia_files = non_dementia_files

    def prepare_dataset(self):
        """
        Loads data for both dementia and non-dementia groups, assigns labels,
        and returns combined lists of text and labels.
        Dementia = 1, Non-dementia = 0.

        :return: (texts, labels)
                 texts: List of text content
                 labels: List of integer labels (1 = dementia, 0 = non-dementia)
        """
        dementia_data = _load_data_from_json_files(self.dementia_files)
        non_dementia_data = _load_data_from_json_files(self.non_dementia_files)

        texts, labels = [], []

        for post in dementia_data:
            texts.append(post["content"])
            labels.append(1)

        for post in non_dementia_data:
            texts.append(post["content"])
            labels.append(0)

        return texts, labels
