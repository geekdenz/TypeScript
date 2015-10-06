package org.netbeans.ts.completion;

import java.io.IOException;
import javax.swing.text.Document;
import javax.swing.text.JTextComponent;
import org.netbeans.api.editor.mimelookup.MimeRegistration;
import org.netbeans.spi.editor.completion.CompletionProvider;
import org.netbeans.spi.editor.completion.CompletionResultSet;
import org.netbeans.spi.editor.completion.CompletionTask;
import org.netbeans.spi.editor.completion.support.AsyncCompletionQuery;
import org.netbeans.spi.editor.completion.support.AsyncCompletionTask;
import org.netbeans.ts.ExecUtils;
import org.netbeans.ts.options.FileUtils;
import org.openide.util.Exceptions;

@MimeRegistration(
		mimeType = "text/x-ts",
		service = CompletionProvider.class)
public class TsCompletionProvider implements CompletionProvider {

	@Override
	public CompletionTask createTask(int queryType, final JTextComponent jtc) {
		return new AsyncCompletionTask(new AsyncCompletionQuery() {
			@Override
			protected void query(CompletionResultSet crs, Document document, int caretOffset) {
				String filename = document.getProperty("title").toString();
				try {
					int offsets[] = FileUtils.getCoordinates(filename, caretOffset);
					System.out.println("OFFSETS: " + offsets[0] +","+ offsets[1]);
					System.out.println("CARET: " + caretOffset);
					String output = ExecUtils.tss(filename, offsets[0], offsets[1] + 1);
					System.out.println("TSS:");
					System.out.println(output);
					System.out.println("TEST: "+ ExecUtils.exec(new String[]{"echo","Hello", "Tim"}));
					System.out.println("/TSS");
				} catch (IOException ex) {
					Exceptions.printStackTrace(ex);
					throw new RuntimeException(ex);
				} catch (InterruptedException ex) {
					Exceptions.printStackTrace(ex);
					throw new RuntimeException(ex);
				}
			}
		}, jtc);
	}

	@Override
	public int getAutoQueryTypes(JTextComponent jtc, String typedText) {
		return 0;
		//throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
	}

}
