#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <sstream>
#include <iomanip>

#include "query/parser.hpp"
#include "query/executor.hpp"
#include "utils/benchmark.hpp"
#include "utils/string_utils.hpp"

using namespace aqe::query;
using namespace aqe::utils;

// Helper: safely escape a JSON string
std::string jsonEscape(const std::string &s) {
    std::ostringstream o;
    for (auto c : s) {
        switch (c) {
            case '\"': o << "\\\""; break;
            case '\\': o << "\\\\"; break;
            case '\b': o << "\\b"; break;
            case '\f': o << "\\f"; break;
            case '\n': o << "\\n"; break;
            case '\r': o << "\\r"; break;
            case '\t': o << "\\t"; break;
            default:
                if (static_cast<unsigned char>(c) < 0x20) {
                    o << "\\u" << std::hex << std::setw(4) << std::setfill('0') << (int)c;
                } else {
                    o << c;
                }
        }
    }
    return o.str();
}

// Convert a QueryResult to a JSON string
std::string resultToJson(const QueryResult& result) {
    std::ostringstream out;
    out << "{";
    out << "\"columns\":[";
    auto cols = result.getColumnNames();
    for (size_t i = 0; i < cols.size(); ++i) {
        if (i) out << ",";
        out << "\"" << jsonEscape(cols[i]) << "\"";
    }
    out << "],";

    out << "\"rows\":[";
    auto rows = result.getRows();
    for (size_t r = 0; r < rows.size(); ++r) {
        if (r) out << ",";
        out << "[";
        for (size_t c = 0; c < rows[r].size(); ++c) {
            if (c) out << ",";
            out << "\"" << jsonEscape(rows[r][c]) << "\"";
        }
        out << "]";
    }
    out << "],";

    out << "\"approximate\":" << (result.isApproximate() ? "true" : "false");
    out << "}";
    return out.str();
}

// Helper function to load data from CSV
std::vector<DataRow> loadDataFromCSV(const std::string& filename) {
    std::vector<DataRow> data;
    std::ifstream file(filename);
    if (!file.is_open()) {
        std::cerr << "Error: Could not open data file: " << filename << std::endl;
        return data;
    }

    // Helper trim
    auto trim = [](const std::string& s) {
        size_t start = s.find_first_not_of(" \t\r\n");
        size_t end = s.find_last_not_of(" \t\r\n");
        if (start == std::string::npos) return std::string();
        return s.substr(start, end - start + 1);
    };

    std::string line;
    std::getline(file, line); // Read header
    std::vector<std::string> headersRaw = splitCSV(line);
    std::vector<std::string> headers;
    headers.reserve(headersRaw.size());
    for (auto& h : headersRaw) {
        headers.push_back(trim(h));  // Ensure clean headers
    }

    while (std::getline(file, line)) {
        if (line.empty() || line == "\r") continue;
        DataRow row;
        auto values = splitCSV(line);
        for (size_t i = 0; i < headers.size() && i < values.size(); ++i) {
            row.values[headers[i]] = values[i];
        }
        data.push_back(row);
    }
    return data;
}


    // UPDATED printResults FUNCTION
    void printResults(const QueryResult& result) {
    const auto& headers = result.getColumnNames();
    const auto& rows = result.getRows();
    
    if (headers.empty()) return;

    std::vector<size_t> widths;
    for (const auto& header : headers) {
        widths.push_back(header.length());
    }

    for (const auto& row : rows) {
        for (size_t i = 0; i < row.size() && i < widths.size(); ++i) {
            if (row[i].length() > widths[i]) {
                widths[i] = row[i].length();
            }
        }
    }

    // Print headers
    for (size_t i = 0; i < headers.size(); ++i) {
        std::cout << std::left << std::setw(widths[i] + 2) << headers[i];
    }
    std::cout << std::endl;

    // Print separator
    for (size_t width : widths) {
        std::cout << std::string(width + 2, '-');
    }
    std::cout << std::endl;

    // Print rows
    for (const auto& row : rows) {
        for (size_t i = 0; i < row.size() && i < widths.size(); ++i) {
            std::cout << std::left << std::setw(widths[i] + 2) << row[i];
        }
        std::cout << std::endl;
    }

    if (result.isApproximate()) {
        std::cout << "\nNote: Results are approximate." << std::endl;
    }
}
int main(int argc, char** argv) {
    std::cerr << "Approximate Query Engine Demo\n";
    std::cerr << "----------------------------\n";
    
    std::string dataFile = "data/friends_data.csv"; // default
    bool jsonOutput = false;
    if (argc >= 2) dataFile = argv[1];
    for (int i = 1; i < argc; ++i) {
        if (std::string(argv[i]) == "--json") jsonOutput = true;
    }

    auto data = loadDataFromCSV(dataFile);
    if (data.empty()) {
        std::cerr << "Error: no rows loaded from " << dataFile << std::endl;
        return 1;
    }
    std::cerr << "Loaded " << data.size() << " rows from " << dataFile << "\n";
    
    QueryParser parser;
    
    // Helper: trim function (reuse earlier trim)
auto trim_str = [](const std::string &s) {
    size_t a = s.find_first_not_of(" \t\r\n");
    if (a == std::string::npos) return std::string();
    size_t b = s.find_last_not_of(" \t\r\n");
    return s.substr(a, b - a + 1);
};

// Load queries: if argv[2] exists, treat it as a path to the queries file (one SQL per line)
std::vector<std::pair<std::string, std::string>> queries;
if (argc >= 3 && std::string(argv[2]) != "") {
    std::ifstream qfile(argv[2]);
    if (!qfile.is_open()) {
        std::cerr << "Warning: Could not open queries file: " << argv[2] << ". Falling back to defaults.\n";
    } else {
        std::string line;
        while (std::getline(qfile, line)) {
            std::string trimmed = trim_str(line);
            if (trimmed.empty()) continue;

            if (trimmed.front() == '{' && trimmed.back() == '}') {
                // ✅ Parse { "desc", "query" }
                size_t firstQuote = trimmed.find('"');
                size_t secondQuote = trimmed.find('"', firstQuote + 1);
                size_t thirdQuote = trimmed.find('"', secondQuote + 1);
                size_t fourthQuote = trimmed.find('"', thirdQuote + 1);

                if (firstQuote != std::string::npos && fourthQuote != std::string::npos) {
                    std::string desc = trimmed.substr(firstQuote + 1, secondQuote - firstQuote - 1);
                    std::string sql  = trimmed.substr(thirdQuote + 1, fourthQuote - thirdQuote - 1);
                    queries.emplace_back(desc, sql);
                    continue;
                }
            }

            // Fallback: treat as plain SQL (existing behavior)
            std::string desc = trimmed.substr(0, std::min<size_t>(60, trimmed.size()));
            queries.emplace_back(desc, trimmed);
        }
    }
}


// If still empty, use the hardcoded defaults
if (queries.empty()) {
    queries = {
        {"Exact COUNT", "SELECT COUNT(value) FROM data"},
        {"Approximate COUNT (10% sample)", "SELECT COUNT(value) FROM data SAMPLE 10%"},
        {"Count GROUP BY", "SELECT category, COUNT(value) FROM data GROUP BY category"},
        {"Stratified Sampling", "SELECT category, COUNT(value) FROM data GROUP BY category SAMPLE STRATIFIED BY category 20%"},
        {"Group By with AVG", "SELECT category, AVG(value) FROM data GROUP BY category"},
        {"Stratified Sampling AVG", "SELECT category, AVG(value) FROM data GROUP BY category SAMPLE STRATIFIED BY category 20%"},
        {"Group By SUM", "SELECT category, SUM(value) FROM data GROUP BY category"},
        {"Stratified Sampling SUM", "SELECT category, SUM(value) FROM data GROUP BY category SAMPLE STRATIFIED BY category 20%"},
    };
}


    std::ostringstream aggregateJson;
if (jsonOutput) {
    aggregateJson << "{ \"queries\": [";
}

for (size_t i = 0; i < queries.size(); ++i) {
    const auto& [description, query_str] = queries[i];
    try {
        Timer timer;

        QueryExecutor executor;
        auto query = parser.parse(query_str);
        auto result = executor.execute(*query, data);

        if (jsonOutput) {
            if (i > 0) aggregateJson << ",";
            aggregateJson << "{";
            aggregateJson << "\"description\":\"" << jsonEscape(description) << "\",";
            aggregateJson << "\"query\":\"" << jsonEscape(query_str) << "\",";
            aggregateJson << "\"executionTimeMs\":" << timer.elapsed() << ",";
            aggregateJson << "\"result\":" << resultToJson(*result);
            aggregateJson << "}";
        } else {
            std::cout << "\nExecuting: " << description << "...\n";
            printResults(*result);
            std::cout << "Execution time: " << timer.elapsed() << "ms\n";
        }

    } catch (const std::exception& e) {
        std::cerr << "Error: " << e.what() << "\n";
    }
}

if (jsonOutput) {
    aggregateJson << "]}";
    std::cout << aggregateJson.str() << std::endl;
}

    return 0;
}