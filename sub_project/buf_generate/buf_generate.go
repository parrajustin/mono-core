package main

import (
	"bytes"
	"flag"
	"fmt"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"

	"github.com/bufbuild/protocompile/parser"
	"github.com/bufbuild/protocompile/reporter"
	"google.golang.org/protobuf/proto"
)

var logger = log.New(
	os.Stdout,
	"ProtoBuf Genereate: ",
	log.Ldate|log.Ltime|log.Lmicroseconds|log.LUTC|log.Lshortfile,
)

func main() {
	var filePath = flag.String("path", "", "The path to the proto file to compile")
	flag.Parse()

	if *filePath == "" {
		fmt.Println("Error: Path flag is required.")
		flag.Usage()
		return
	}
	fileName := filepath.Base(*filePath)

	data, err := os.ReadFile(*filePath)
	if err != nil {
		logger.Fatalf("Failed to read file %s due to %v", *filePath, err)
		return
	}

	ast, err := parser.Parse(fileName, bytes.NewReader(data), reporter.NewHandler(nil))
	if err != nil {
		logger.Fatalf("Failed to parse file %s due to %v", *filePath, err)
		return
	}
	parseResult, err := parser.ResultFromAST(ast, true, reporter.NewHandler(nil))
	if err != nil {
		logger.Fatalf("Failed to get AST from file %s due to %v", *filePath, err)
		return
	}

	fd := parseResult.FileDescriptorProto()
	byteData, err := proto.Marshal(fd)
	if err != nil {
		logger.Fatalf("Failed to get binary data from file descriptor %v", err)
		return
	}

	dirOfFile := filepath.Dir(*filePath)
	nameWithoutExt := strings.Split(fileName, ".")[0]
	outputFile := path.Join(dirOfFile, fmt.Sprintf("%s.bin", nameWithoutExt))
	// Write the binary data to the file.
	err = os.WriteFile(outputFile, byteData, 0644) // 0644 file permissions
	if err != nil {
		logger.Fatalf("Error writing to file %s: %v", outputFile, err)
		return
	}
}
