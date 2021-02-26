<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="popup-event">
	<div class="popup-event">
		<div>
			<i class="calendar-color purple"></i>
			<h3><xsl:value-of select="@title"/></h3>
		</div>
		<div>
			<i class="icon-location-pin"></i>
			<input type="text" placeholder="Add Location"/>
		</div>
		<hr/>
		<div>
			<i class="icon-calendar"></i>
			<div>25 Feb 2021 09:15 to 11:45</div>
		</div>
		<hr/>
		<div>
			<i class="icon-user"></i>
			<input type="text" placeholder="Add Invitees"/>
		</div>
		<hr/>
		<div>
			<i class="icon-paperclip"></i>
			<input type="text" placeholder="Add Notes, URL or Attachments"/>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>

