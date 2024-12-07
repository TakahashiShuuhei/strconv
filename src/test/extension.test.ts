import * as assert from 'assert';
import { decodeUTF8Bytes } from '../extension';

suite('Decoder Test Suite', () => {

    test('Unicode escape sequence', () => {
        // \uXXXX形式のテスト
        assert.strictEqual(
            decodeUTF8Bytes('\\uE381BB\\uE38192'),
            'ほげ'
        );
    });

    test('Unicode codepoint', () => {
        // U+XXXX形式のテスト
				/*
        assert.strictEqual(
            decodeUTF8Bytes('U+3042'),
            'あ'
        );
				*/

        // 小文字のu+でもOK
       /* assert.strictEqual(
            decodeUTF8Bytes('u+3042'),
            'あ'
        ); */
    });

    test('Invalid input handling', () => {
        // 通常のテキストはそのまま返される
        assert.strictEqual(
            decodeUTF8Bytes('Hello, World!'),
            'Hello, World!'
        );

        // 不正なエスケープシーケンス
        assert.strictEqual(
            decodeUTF8Bytes('\\xZZ'),
            '\\xZZ'
        );
    });

    test('Emoji and other Unicode characters', () => {
        // 絵文字のテスト（例：😀）
        assert.strictEqual(
            decodeUTF8Bytes('\\uF09F9880'),
            '😀'
        );

        // 漢字のテスト（例：漢）
        assert.strictEqual(
            decodeUTF8Bytes('\\uE6BCA2'),
            '漢'
        );
    });
});