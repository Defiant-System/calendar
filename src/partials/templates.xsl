<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template name="popup-event">
	<div class="popup-event" data-area="popup">
		<xsl:attribute name="data-id"><xsl:value-of select="@id"/></xsl:attribute>
		<div class="row-head">
			<i>
				<xsl:attribute name="class">calendar-color <xsl:value-of select="@calId"/></xsl:attribute>
			</i>
			<h3 contenteditable="true" placeholder="New Event" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
				<xsl:if test="not(@isNew)"><xsl:value-of select="@title"/></xsl:if>
			</h3>
		</div>
		<div class="row-location">
			<i class="icon-location-pin"></i>
			<input type="text" placeholder="Add Location"/>
		</div>
		<hr/>
		<div class="row-date">
			<i class="icon-calendar"></i>
			<div>
				<span class="event-date">25 Feb 2021</span>
				<span class="event-starts" data-change="popup-time-change">09:15</span>
				<span>to</span>
				<span class="event-ends" data-change="popup-time-change">11:45</span>
			</div>
		</div>
		<hr/>
		<div class="row-users">
			<i class="icon-user"></i>
			<input type="text" placeholder="Add Invitees"/>
		</div>
		<hr/>
		<div class="row-attachments">
			<i class="icon-paperclip"></i>
			<input type="text" placeholder="Add Notes, URL or Attachments"/>
		</div>
	</div>
</xsl:template>

</xsl:stylesheet>

